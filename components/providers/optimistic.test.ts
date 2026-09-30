import { describe, expect, it } from "vitest";
import {
  relinkTasks,
  removeById,
  restoreAt,
  restoreRows,
  revertFields,
  revertRow,
} from "@/components/providers/optimistic";

const a = { id: "a", title: "A", status: "Not started", subject_id: "s1" as string | null };
const b = { id: "b", title: "B", status: "Not started", subject_id: "s1" as string | null };
const c = { id: "c", title: "C", status: "Not started", subject_id: "s2" as string | null };

describe("undo helpers", () => {
  it("removes an added row", () => {
    expect(removeById([a, b], "b")).toEqual([a]);
  });

  it("reverts only the fields a failed update changed", () => {
    // The failed change set status; the title was edited separately afterwards.
    const current = { ...a, status: "Completed", title: "A, edited later" };
    expect(revertFields(current, { status: "Completed" }, a)).toEqual({
      ...a,
      title: "A, edited later",
    });
  });

  it("keeps a later edit to the same field", () => {
    const current = { ...a, status: "In progress" }; // a later change overwrote "Completed"
    expect(revertFields(current, { status: "Completed" }, a).status).toBe("In progress");
  });

  it("reverts one row in a list", () => {
    const list = [a, { ...b, status: "Completed" }];
    expect(revertRow(list, "b", { status: "Completed" }, b)).toEqual([a, b]);
  });

  it("puts a deleted row back at its old position, once", () => {
    expect(restoreAt([a, c], b, 1)).toEqual([a, b, c]);
    expect(restoreAt([a], c, 5)).toEqual([a, c]);
    const list = [a, b];
    expect(restoreAt(list, b, 0)).toBe(list);
  });

  it("undoes a subject delete: restores cascaded rows and relinks its tasks", () => {
    const logs = [{ id: "l1" }, { id: "l2" }];
    expect(restoreRows([{ id: "l2" }], logs)).toEqual([{ id: "l2" }, { id: "l1" }]);

    const afterDelete = [
      { ...a, subject_id: null },
      { ...b, subject_id: "s3" }, // moved to another subject in the meantime
      c,
    ];
    expect(relinkTasks(afterDelete, new Set(["a", "b"]), "s1")).toEqual([
      a,
      { ...b, subject_id: "s3" },
      c,
    ]);
  });
});
