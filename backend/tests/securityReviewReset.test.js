
const mockClient = {
    query: jest.fn(),
    release: jest.fn()
};

// Replace PostgreSQL with a controlled test client
jest.mock("../db", () => ({
    connect: jest.fn()
}));

const pool = require("../db");
const taskModel = require("../models/taskModel");

// Simulate a security-sensitive task awaiting review
function createTaskRow() {
    return {
        id: 2,
        status: "IN_REVIEW",
        assigned_to: 3,
        is_security_sensitive: true
    };
}

// Simulate the database queries used during status updates
function mockDatabase(task) {
    mockClient.query.mockImplementation(async (sql, params) => {
        const statement = String(sql).trim();

        if (
            statement === "BEGIN" ||
            statement === "COMMIT" ||
            statement === "ROLLBACK"
        ) {
            return { rows: [] };
        }

        // Return the task being changed
        if (
            statement.startsWith("SELECT") &&
            statement.includes("FROM tasks")
        ) {
            return { rows: [task] };
        }

// Simulate one security checklist being successfully reset
        if (statement.startsWith("UPDATE task_security_reviews")) {
            return {
                rowCount: 1,
                rows: [{
                    code_reviewed: false,
                    security_tests_passed: false,
                    no_unresolved_vulnerabilities: false,
                    reviewed_by: null,
                    reviewed_at: null
                }]
            };
        }


        // Simulate updating the task status
        if (statement.startsWith("UPDATE tasks")) {
            return {
                rows: [{
                    id: task.id,
                    status: params[0]
                }]
            };
        }

        // Simulate recording audit history
        if (
            statement.startsWith("INSERT INTO task_audit_logs")
        ) {
            return { rows: [] };
        }

        throw new Error(`Unexpected SQL in test: ${statement}`);
    });

    pool.connect.mockResolvedValue(mockClient);
}

describe("VertexArc Security Review Reset", () => {

    beforeEach(() => {
        jest.resetAllMocks();
    });

    test("Resets security approvals when reviewer requests changes", async () => {
        const task = createTaskRow();

        mockDatabase(task);

        const result = await taskModel.updateTaskStatus(
            2,
            "1",
            "IN_REVIEW",
            "IN_PROGRESS",
            1,
            true
        );

        expect(result).not.toBeNull();
        expect(result.status).toBe("IN_PROGRESS");

        // Confirm the security checklist was reset
        const resetQueries = mockClient.query.mock.calls.filter(
            ([sql]) =>
                String(sql).trim().startsWith(
                    "UPDATE task_security_reviews"
                )
        );

        expect(resetQueries).toHaveLength(1);
    });

    test("Records a security review reset in the audit log", async () => {
        const task = createTaskRow();

        mockDatabase(task);

        await taskModel.updateTaskStatus(
            2,
            "1",
            "IN_REVIEW",
            "IN_PROGRESS",
            1,
            true
        );

        // Find audit log insert operations
        const auditQueries = mockClient.query.mock.calls.filter(
            ([sql]) =>
                String(sql).trim().startsWith(
                    "INSERT INTO task_audit_logs"
                )
        );

        expect(auditQueries.length).toBeGreaterThanOrEqual(2);

        
// Check the SQL statements for the two audit action names
    const auditStatements = auditQueries.map(
        ([sql]) => String(sql)
    );

    expect(
        auditStatements.some(sql =>
            sql.includes("SECURITY_REVIEW_RESET")
        )
    ).toBe(true);

    expect(
        auditStatements.some(sql =>
            sql.includes("STATUS_CHANGED")
        )
    ).toBe(true);
});
    

    test("Does not reset approvals for a normal task", async () => {
        const task = {
            ...createTaskRow(),
            is_security_sensitive: false
        };

        mockDatabase(task);

        const result = await taskModel.updateTaskStatus(
            2,
            "1",
            "IN_REVIEW",
            "IN_PROGRESS",
            1,
            true
        );

        expect(result.status).toBe("IN_PROGRESS");

        // Normal tasks should not update security checklists
        const resetQueries = mockClient.query.mock.calls.filter(
            ([sql]) =>
                String(sql).trim().startsWith(
                    "UPDATE task_security_reviews"
                )
        );

        expect(resetQueries).toHaveLength(0);
    });

    test("Commits the transaction after a successful reset", async () => {
        const task = createTaskRow();

        mockDatabase(task);

        await taskModel.updateTaskStatus(
            2,
            "1",
            "IN_REVIEW",
            "IN_PROGRESS",
            1,
            true
        );

        expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
        expect(mockClient.release).toHaveBeenCalledTimes(1);
    });

});

