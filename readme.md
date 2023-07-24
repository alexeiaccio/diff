# diff

```javascript
diff(left, right);
```

The `diff` function compares two objects and generates a difference report between them. It identifies added, removed, changed, nested, and unchanged properties, and returns an array of differences.

Parameters
`left` (object): The `left` object to compare.
`right` (object): The `right` object to compare.
Return Value
An array containing the differences between the `left` and `right` objects. Each difference is represented as an object with the following properties:

`key` (string): The key of the property that has a difference.
`old_value` (any): The value of the property in the `left` object (null for added properties).
`new_value` (any): The value of the property in the `right` object (null for removed properties).
`type` (string): The type of difference. Possible values are "added", "removed", "changed", "nested", or "unchanged".
`children` (array): An array of nested differences (present only for nested properties).

## Example

```javascript
const left = {
  name: "John",
  age: 30,
  address: {
    city: "New York",
    country: "USA",
  },
};

const right = {
  name: "John",
  age: 35,
  address: {
    city: "San Francisco",
    country: "USA",
  },
  email: "john@example.com",
};

const differences = diff(left, right);
console.log(differences);
```

## Output:

```javascript
[
  {
    key: "age",
    old_value: 30,
    new_value: 35,
    type: "changed",
  },
  {
    key: "address",
    old_value: null,
    new_value: null,
    children: [
      {
        key: "city",
        old_value: "New York",
        new_value: "San Francisco",
        type: "changed",
      },
    ],
    type: "nested",
  },
  {
    key: "email",
    old_value: null,
    new_value: "john@example.com",
    type: "added",
  },
];
```

In the above example, the `diff` function is used to compare two objects `left` and right. The resulting differences are logged to the console, indicating that the age property has changed, the address.city property has changed, and the email property has been added to the `right` object.

# printDiff

```javascript
printDiff(data);
```

The `printDiff` function takes a difference report between two objects and returns it as a formatted string.

Parameters
`data` (Object): The input object to compare and generate the difference report.
Return Value
A formatted string representing the difference report.

## Example

```javascript
const obj1 = {
  a: 1,
  b: 2,
};

const obj2 = {
  a: 1,
  b: 3,
};

console.log(printDiff(obj1, obj2));
```

## Output:

```bash
{
  - b: 2,
  + b: 3
}
```

In the above example, the `printDiff` function generates a difference report between `obj1` and `obj2`. It detects that the value of the b property has changed from 2 to 3 and represents it as `- b: 2` (removed) and `+ b: 3` (added).

## How it Works

1. The `printDiff` function takes an input object `data`.
2. It initializes an empty array called `result` to store the lines of the difference report.
3. It pushes an opening curly brace { to the `result` array to start the report.
4. It calls the `recursion` function to generate the difference report recursively.
5. It pushes the lines of the difference report returned by the `recursion` function to the `result` array.
6. It pushes a closing curly brace } to the `result` array to end the report.
7. It joins the lines of the `result` array with newline characters `\n` and returns the formatted string.

For more details on how the difference report is generated, you can refer to the recursion function in the code snippet.
