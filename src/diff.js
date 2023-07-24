function isObject(x) {
  return x && typeof x === "object" && !Array.isArray(x);
}

export function diff(left, right) {
  const result = [];

  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);

  rightKeys.forEach((key) => {
    if (!leftKeys.includes(key)) {
      // 1. Added – if right don't exist in left
      if (isObject(right[key])) {
        //  - objects
        result.push({
          key,
          old_value: null,
          new_value: diff(right[key], right[key]),
          type: "added",
        });
      } else {
        //  - primitives
        result.push({
          key,
          old_value: null,
          new_value: right[key],
          type: "added",
        });
      }
    }
  });

  leftKeys.forEach((key) => {
    const leftIsObject = isObject(left[key]);
    const rightIsObject = isObject(right[key]);

    if (!right[key]) {
      // 2. Removed – if left don't exist in right
      if (leftIsObject) {
        //  - objects
        result.push({
          key,
          old_value: diff(left[key], left[key], result),
          new_value: null,
          type: "removed",
        });
      } else {
        //  - primitives
        result.push({
          key,
          old_value: left[key],
          new_value: null,
          type: "removed",
        });
      }
    } else if (leftIsObject || rightIsObject) {
      // 3. Changed – if left and right have different object values
      if (!leftIsObject && rightIsObject) {
        //  - left is primitive and right is object
        result.push({
          key,
          old_value: left[key],
          new_value: diff(right[key], right[key]),
          type: "changed",
        });
      }
      if (leftIsObject && !rightIsObject) {
        //  - left is object and right is primitive
        result.push({
          key,
          old_value: diff(left[key], left[key]),
          new_value: right[key],
          type: "changed",
        });
      }
      if (leftIsObject && rightIsObject) {
        // 4. Nested – if booth left and right have object values
        result.push({
          key,
          old_value: null,
          new_value: null,
          children: diff(left[key], right[key]),
          type: "nested",
        });
      }
    } else if (left[key] !== right[key]) {
      // 5. Changed – if left and right have different primitive values
      result.push({
        key,
        old_value: left[key],
        new_value: right[key],
        type: "changed",
      });
    } else {
      // 6. Unchanged – if left and right have same primitive values
      result.push({
        key,
        old_value: left[key],
        new_value: right[key],
        type: "unchanged",
      });
    }
  });

  return result;
}

/**
 * ```
 * {
 *     a: "a",
 *   - b: "b",
 *   + b: "bb",
 *     c: {
 *         d: "d",
 *       + e: {
 *           f: "f",
 *        },
 *     },
 * }
 * ```
 */
function recursion(arr, level = 1) {
  const res = [];
  const indent = "  ".repeat(level);

  arr.forEach(({ key, old_value, new_value, type, children }) => {
    if (type === "added") {
      // 1. Added – if right don't exist in left
      if (Array.isArray(new_value)) {
        //  - objects
        res.push(`${indent}+ ${key}: {`);
        res.push(...recursion(new_value, level + 2));
        res.push(`${indent}  }`);
      } else {
        //  - primitives
        res.push(`${indent}+ ${key}: ${new_value}`);
      }
    } else if (type === "removed") {
      // 2. Removed – if left don't exist in right
      if (Array.isArray(old_value)) {
        //  - objects
        res.push(`${indent}- ${key}: {`);
        res.push(...recursion(old_value, level + 2));
        res.push(`${indent}  }`);
      } else {
        //  - primitives
        res.push(`${indent}- ${key}: ${old_value}`);
      }
    } else if (type === "changed") {
      // 3. Changed – if left and right have different primitive values
      if (!Array.isArray(old_value) && Array.isArray(new_value)) {
        //  - left is primitive and right is object
        res.push(`${indent}- ${key}: ${old_value}`);
        res.push(`${indent}+  ${key}: {`);
        res.push(...recursion(new_value, level + 2));
        res.push(`${indent}  }`);
      } else if (Array.isArray(old_value) && !Array.isArray(new_value)) {
        //  - left is object and right is primitive
        res.push(`${indent}- ${key}: {`);
        res.push(...recursion(old_value, level + 2));
        res.push(`${indent}  }`);
        res.push(`${indent}+ ${key}: ${new_value}`);
      } else {
        //  - left and right is primitive
        res.push(`${indent}- ${key}: ${old_value}`);
        res.push(`${indent}+ ${key}: ${new_value}`);
      }
    } else if (type === "nested") {
      // 4. Nested – if booth left and right have object values
      res.push(`${indent}  ${key}: {`);
      res.push(...recursion(children, level + 2));
      res.push(`${indent}  }`);
    } else if (type === "unchanged") {
      // 5. Unchanged – if left and right have same primitive values
      res.push(`${indent}  ${key}: ${new_value}`);
    }
  });

  return res;
}

export function printDiff(data) {
  const result = [];
  result.push("{");
  result.push(...recursion(data));
  result.push("}");
  return result.join("\n");
}

// in-source test suites
if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;
  const LEFT = {
    unchanged_primitive: "unchanged_primitive",
    changed_primitive: "changed",
    deleted_primitive: "deleted_primitive",
    nested: {
      nested_unchanged: "nested_unchanged",
      nested_deleted: "nested_deleted",
    },
    changed_nested: {
      changed_to_object: "changed_to_object",
      changed_to_primitive: {
        changed_to_primitive_nested: {
          changed_to_primitive_value: "changed_to_primitive_value",
        },
      },
    },
    removed_object: {
      removed_value: "removed_value",
    },
  };
  const RIGHT = {
    unchanged_primitive: "unchanged_primitive",
    changed_primitive: "changed_primitive",
    added_primitive: "added_primitive",
    nested: {
      nested_unchanged: "nested_unchanged",
      added_object: {
        added_unchanged: "added_unchanged",
      },
    },
    changed_nested: {
      changed_to_object: {
        changed_to_object_value: "changed_to_object_value",
      },
      changed_to_primitive: "changed_to_primitive",
    },
  };
  test("diff", () => {
    const result = diff(LEFT, RIGHT);
    expect(result).toMatchInlineSnapshot(`
      [
        {
          "key": "added_primitive",
          "new_value": "added_primitive",
          "old_value": null,
          "type": "added",
        },
        {
          "key": "unchanged_primitive",
          "new_value": "unchanged_primitive",
          "old_value": "unchanged_primitive",
          "type": "unchanged",
        },
        {
          "key": "changed_primitive",
          "new_value": "changed_primitive",
          "old_value": "changed",
          "type": "changed",
        },
        {
          "key": "deleted_primitive",
          "new_value": null,
          "old_value": "deleted_primitive",
          "type": "removed",
        },
        {
          "children": [
            {
              "key": "added_object",
              "new_value": [
                {
                  "key": "added_unchanged",
                  "new_value": "added_unchanged",
                  "old_value": "added_unchanged",
                  "type": "unchanged",
                },
              ],
              "old_value": null,
              "type": "added",
            },
            {
              "key": "nested_unchanged",
              "new_value": "nested_unchanged",
              "old_value": "nested_unchanged",
              "type": "unchanged",
            },
            {
              "key": "nested_deleted",
              "new_value": null,
              "old_value": "nested_deleted",
              "type": "removed",
            },
          ],
          "key": "nested",
          "new_value": null,
          "old_value": null,
          "type": "nested",
        },
        {
          "children": [
            {
              "key": "changed_to_object",
              "new_value": [
                {
                  "key": "changed_to_object_value",
                  "new_value": "changed_to_object_value",
                  "old_value": "changed_to_object_value",
                  "type": "unchanged",
                },
              ],
              "old_value": "changed_to_object",
              "type": "changed",
            },
            {
              "key": "changed_to_primitive",
              "new_value": "changed_to_primitive",
              "old_value": [
                {
                  "children": [
                    {
                      "key": "changed_to_primitive_value",
                      "new_value": "changed_to_primitive_value",
                      "old_value": "changed_to_primitive_value",
                      "type": "unchanged",
                    },
                  ],
                  "key": "changed_to_primitive_nested",
                  "new_value": null,
                  "old_value": null,
                  "type": "nested",
                },
              ],
              "type": "changed",
            },
          ],
          "key": "changed_nested",
          "new_value": null,
          "old_value": null,
          "type": "nested",
        },
        {
          "key": "removed_object",
          "new_value": null,
          "old_value": [
            {
              "key": "removed_value",
              "new_value": "removed_value",
              "old_value": "removed_value",
              "type": "unchanged",
            },
          ],
          "type": "removed",
        },
      ]
    `);
  });
  test("printDiff", () => {
    const result = printDiff(diff(LEFT, RIGHT));
    expect(result).toMatchInlineSnapshot(`
      "{
        + added_primitive: added_primitive
          unchanged_primitive: unchanged_primitive
        - changed_primitive: changed
        + changed_primitive: changed_primitive
        - deleted_primitive: deleted_primitive
          nested: {
            + added_object: {
                  added_unchanged: added_unchanged
              }
              nested_unchanged: nested_unchanged
            - nested_deleted: nested_deleted
          }
          changed_nested: {
            - changed_to_object: changed_to_object
            +  changed_to_object: {
                  changed_to_object_value: changed_to_object_value
              }
            - changed_to_primitive: {
                  changed_to_primitive_nested: {
                      changed_to_primitive_value: changed_to_primitive_value
                  }
              }
            + changed_to_primitive: changed_to_primitive
          }
        - removed_object: {
              removed_value: removed_value
          }
      }"
    `);
  });
}
