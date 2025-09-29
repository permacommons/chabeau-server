| **Method** | ***Endpoint*** | *Description* | **Auth** | Example |
|------------|----------------|---------------|----------|---------|
| **GET** | `/api/users` | *List all users* | 🔐 **Required** | [Try it](https://api.example.com/docs#get-users) |
| ***POST*** | `/api/users` | **Create new user** | 🔐 *Required* | [Example](https://api.example.com/docs#post-users) |
| **PUT** | `/api/users/{id}` | ***Update user*** | 🔐 **Required** | `curl -X PUT /api/users/123` |
| *DELETE* | `/api/users/{id}` | **Delete user** | 🔐 ***Admin Only*** | [Docs](https://api.example.com/docs#delete-users) |