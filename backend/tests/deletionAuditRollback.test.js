const pool = require("../db");
const taskModel = require("../models/taskModel");
const projectModel = require("../models/projectModel");

// Mock the database connection so tests never modify real data
jest.mock("../db", () => ({
    connect: jest.fn()
}));

describe("Deletion audit transaction rollback", () => {
    let client;

    beforeEach(() => {
        jest.resetAllMocks();

        client = {
            query: jest.fn(),
            release: jest.fn()
        };

        pool.connect.mockResolvedValue(client);
    });

    test("Task deletion rolls back when audit logging fails", async () => {
        client.query.mockImplementation(async (sql) => {
            if (sql.includes("SELECT id, project_id, title, status")) {
                return {
                    rows: [{
                        id: 5,
                        project_id: 1,
                        title: "Security Task",
                        status: "IN_REVIEW"
                    }]
                };
            }

            if (sql.includes("UPDATE tasks")) {
                return {
                    rows: [{
                        id: 5,
                        project_id: 1,
                        title: "Security Task",
                        deleted_at: new Date()
                    }]
                };
            }

            if (sql.includes("INSERT INTO task_audit_logs")) {
                throw new Error("Audit log insertion failed");
            }

            return { rows: [] };
        });

        await expect(
            taskModel.softDeleteTask(5, 1, 2)
        ).rejects.toThrow("Audit log insertion failed");

        expect(client.query).toHaveBeenCalledWith("ROLLBACK");
        expect(client.query).not.toHaveBeenCalledWith("COMMIT");
        expect(client.release).toHaveBeenCalled();
    });

    test("Project deletion rolls back when audit logging fails", async () => {
        client.query.mockImplementation(async (sql) => {
            if (sql.includes("SELECT id, name, created_by")) {
                return {
                    rows: [{
                        id: 1,
                        name: "Example Project",
                        created_by: 2
                    }]
                };
            }

            if (sql.includes("UPDATE projects")) {
                return {
                    rows: [{
                        id: 1,
                        name: "Example Project",
                        created_by: 2,
                        deleted_at: new Date()
                    }]
                };
            }

            if (sql.includes("INSERT INTO project_audit_logs")) {
                throw new Error("Audit log insertion failed");
            }

            return { rows: [] };
        });

        await expect(
            projectModel.softDeleteProject(1, 2)
        ).rejects.toThrow("Audit log insertion failed");

        expect(client.query).toHaveBeenCalledWith("ROLLBACK");
        expect(client.query).not.toHaveBeenCalledWith("COMMIT");
        expect(client.release).toHaveBeenCalled();
    });
});
