
const mockClient = {
    query: jest.fn(),
    release: jest.fn()
};

// Mock PostgreSQL before importing the task model
jest.mock("../db", () => ({
    connect: jest.fn()
}));

const pool = require("../db");
const taskModel = require("../models/taskModel");

// Simulate a task already waiting for review
function createTaskRow(isSecuritySensitive) {
    return {
        id: 2,
        status: "IN_REVIEW",
        assigned_to: 3,
        is_security_sensitive: isSecuritySensitive
    };
}

// Simulate the three security approval checks
function createReviewRow(code, tests, vulnerabilities) {
    return {
        code_reviewed: code,
        security_tests_passed: tests,
        no_unresolved_vulnerabilities: vulnerabilities
    };
}

// Provide database responses based on the SQL being executed
function mockDatabase(task, review = null) {
    mockClient.query.mockImplementation(async (sql) => {
        const statement = String(sql).trim();

        if (
            statement === "BEGIN" ||
            statement === "COMMIT" ||
            statement === "ROLLBACK"
        ) {
            return { rows: [] };
        }

        // Return the task being updated
        if (statement.startsWith("SELECT") &&
            statement.includes("FROM tasks")) {
            return { rows: [task] };
        }

        // Return the security checklist
        if (statement.startsWith("SELECT") &&
            statement.includes("FROM task_security_reviews")) {
            return { rows: review ? [review] : [] };
        }

        // Simulate a successful status update
        if (statement.startsWith("UPDATE tasks")) {
            return {
                rows: [{
                    id: task.id,
                    status: "DONE"
                }]
            };
        }

        // Simulate audit log creation
        if (statement.startsWith("INSERT INTO task_audit_logs")) {
            return { rows: [] };
        }

        throw new Error(`Unexpected SQL in test: ${statement}`);
    });

    pool.connect.mockResolvedValue(mockClient);
}

describe("VertexArc Security Approval Gate", () => {

    beforeEach(() => {
        jest.resetAllMocks();
    });

    test("Blocks DONE when no security checks are complete", async () => {
        const task = createTaskRow(true);
        const review = createReviewRow(false, false, false);

        mockDatabase(task, review);

        const result = await taskModel.updateTaskStatus(
            2, "1", "IN_REVIEW", "DONE", 1, true
        );

        expect(result).toBeNull();

        expect(mockClient.query).not.toHaveBeenCalledWith(
            expect.stringContaining("UPDATE tasks"),
            expect.anything()
        );
    });

    test("Blocks DONE when one security check is incomplete", async () => {
        const task = createTaskRow(true);
        const review = createReviewRow(true, true, false);

        mockDatabase(task, review);

        const result = await taskModel.updateTaskStatus(
            2, "1", "IN_REVIEW", "DONE", 1, true
        );

        expect(result).toBeNull();
    });

    test("Allows DONE when all security checks are complete", async () => {
        const task = createTaskRow(true);
        const review = createReviewRow(true, true, true);

        mockDatabase(task, review);

        const result = await taskModel.updateTaskStatus(
            2, "1", "IN_REVIEW", "DONE", 1, true
        );

        expect(result).not.toBeNull();
        expect(result.status).toBe("DONE");
    });

    test("Allows a normal task to reach DONE without security checks", async () => {
        const task = createTaskRow(false);

        mockDatabase(task);

        const result = await taskModel.updateTaskStatus(
            2, "1", "IN_REVIEW", "DONE", 1, true
        );

        expect(result).not.toBeNull();
        expect(result.status).toBe("DONE");
    });

});
