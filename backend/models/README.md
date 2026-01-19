# Models Directory

This directory contains all database models for the OBE System. All models extend the BaseModel class which provides common CRUD operations.

## BaseModel

The `BaseModel.js` provides a base class with standard database operations for MySQL.

### Features

- **CRUD Operations**: Create, Read, Update, Delete
- **Query Building**: Flexible query options
- **Promise-based**: All methods return promises
- **Error Handling**: Comprehensive error handling
- **Type Safety**: JSDoc type annotations

### Available Methods

#### `findAll(options)`
Retrieve all records from the table.

```javascript
const users = await userModel.findAll({
  columns: ['id', 'name', 'email'],
  orderBy: 'created_at',
  order: 'DESC',
  limit: 10,
  offset: 0
});
```

#### `findById(id, idColumn = 'id')`
Find a single record by ID.

```javascript
const user = await userModel.findById(1);
// or with custom ID column
const user = await userModel.findById('user123', 'user_id');
```

#### `findWhere(conditions, options)`
Find records matching specific conditions.

```javascript
const activeUsers = await userModel.findWhere(
  { is_active: 1, role: 'student' },
  { 
    orderBy: 'name',
    limit: 50 
  }
);
```

#### `create(data)`
Create a new record.

```javascript
const result = await userModel.create({
  name: 'John Doe',
  email: 'john@example.com',
  password: hashedPassword
});
console.log(result.insertId); // ID of newly created record
```

#### `update(data, conditions)`
Update records matching conditions.

```javascript
const result = await userModel.update(
  { is_active: 0 },
  { id: 1 }
);
console.log(result.affectedRows); // Number of updated rows
```

#### `delete(conditions)`
Delete records matching conditions.

```javascript
const result = await userModel.delete({ id: 1 });
console.log(result.affectedRows); // Number of deleted rows
```

#### `count(conditions)`
Count records matching conditions.

```javascript
const totalUsers = await userModel.count();
const activeUsers = await userModel.count({ is_active: 1 });
```

#### `exists(conditions)`
Check if a record exists.

```javascript
const userExists = await userModel.exists({ email: 'john@example.com' });
```

#### `executeQuery(query, params)`
Execute a raw SQL query.

```javascript
const results = await userModel.executeQuery(
  'SELECT * FROM users WHERE created_at > ?',
  ['2024-01-01']
);
```

## Creating a New Model

To create a new model, extend the BaseModel class:

```javascript
const BaseModel = require('./BaseModel');

class Student extends BaseModel {
  constructor() {
    super('students'); // Pass table name
  }

  // Add custom methods specific to Student
  async findByRollNumber(rollNumber) {
    const students = await this.findWhere({ roll_number: rollNumber });
    return students.length > 0 ? students[0] : null;
  }

  async findByDepartment(departmentId) {
    return this.findWhere(
      { department_id: departmentId },
      { orderBy: 'name' }
    );
  }
}

module.exports = Student;
```

## Usage Example

```javascript
const User = require('./models/User');

// Create instance
const userModel = new User();

// Find all users
const allUsers = await userModel.findAll();

// Find specific user
const user = await userModel.findById(1);

// Find by email (custom method)
const user = await userModel.findByEmail('john@example.com');

// Create new user
const newUser = await userModel.create({
  name: 'Jane Doe',
  email: 'jane@example.com',
  password: 'hashedPassword123'
});

// Update user
await userModel.update(
  { name: 'Jane Smith' },
  { id: newUser.insertId }
);

// Delete user
await userModel.delete({ id: newUser.insertId });
```

## Best Practices

1. **Always use parameterized queries**: The BaseModel uses parameterized queries to prevent SQL injection
2. **Handle errors**: Wrap database operations in try-catch blocks
3. **Use transactions**: For operations involving multiple tables
4. **Validate data**: Validate data before passing to create/update methods
5. **Use custom methods**: Add model-specific methods for complex queries

## Error Handling

All methods throw errors with descriptive messages. Always wrap in try-catch:

```javascript
try {
  const user = await userModel.findById(1);
  if (!user) {
    throw new Error('User not found');
  }
} catch (error) {
  console.error('Error:', error.message);
}
```

## Database Connection

The BaseModel uses the database connection pool from `config/database.js`. Ensure your `.env` file has the correct database credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=admin1433
DB_NAME=obe_system
DB_PORT=3306
```
