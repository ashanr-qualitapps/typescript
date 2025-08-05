# Primitive Types in TypeScript

TypeScript includes JavaScript's primitive types with additional type safety:

## Basic Types

### String
```typescript
let name: string = "John";
let greeting = 'Hello'; // Type inference
```

### Number
```typescript
let age: number = 30;
let decimal = 6.78;
let hex = 0xf00d;
let binary = 0b1010;
let octal = 0o744;
```

### Boolean
```typescript
let isActive: boolean = true;
let isComplete = false; // Type inference
```

### Null and Undefined
```typescript
let u: undefined = undefined;
let n: null = null;
```

## Type Inference

TypeScript can infer types when variables are initialized:

```typescript
let inferredName = "Jane";  // Type: string
let inferredAge = 25;       // Type: number
let inferredActive = true;  // Type: boolean
```

## When to Use Type Annotations

- When declaring a variable without initialization
- When you want a type that's different from the inferred type
- When a function returns the `any` type

## Example Usage

```typescript
// Function with primitive types
function greet(name: string, age: number): string {
  return `Hello ${name}, you are ${age} years old.`;
}

// Using the function
const message = greet("Alice", 30);
console.log(message);
```
