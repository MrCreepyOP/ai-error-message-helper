export const SUPPORTED_TECHNOLOGIES = [
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'Express.js',
  'MongoDB',
  'HTML and CSS',
  'Python',
  'Java',
  'C',
  'C++',
  'C#',
  'PHP',
  'SQL',
  'Next.js',
  'Other / Unknown'
];

export const MAX_ERROR_CHARACTERS = 5000;

export const EXAMPLE_ERRORS = [
  {
    id: 'js-typeerror',
    label: 'JavaScript TypeError',
    technology: 'JavaScript',
    icon: '⚡',
    description: 'Cannot read properties of undefined (reading \'map\')',
    error: `TypeError: Cannot read properties of undefined (reading 'map')
    at UserList (src/components/UserList.jsx:14:22)
    at renderWithHooks (node_modules/react-dom/cjs/react-dom.development.js:14985:18)
    at mountIndeterminateComponent (node_modules/react-dom/cjs/react-dom.development.js:17811:13)
    at beginWork (node_modules/react-dom/cjs/react-dom.development.js:19049:16)`
  },
  {
    id: 'node-econnrefused',
    label: 'Node.js ECONNREFUSED',
    technology: 'Node.js',
    icon: '🔌',
    description: 'Connection refused on port 5432',
    error: `Error: connect ECONNREFUSED 127.0.0.1:5432
    at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1494:16)
    at TCPConnectWrap.callbackTrampoline (node:internal/async_hooks:130:17) {
  errno: -4078,
  code: 'ECONNREFUSED',
  syscall: 'connect',
  address: '127.0.0.1',
  port: 5432
}`
  },
  {
    id: 'mongo-timeout',
    label: 'MongoDB Timeout',
    technology: 'MongoDB',
    icon: '🍃',
    description: 'Server selection timeout on cluster replica set',
    error: `MongooseServerSelectionError: Could not connect to any servers in your MongoDB Atlas cluster. One common reason is that you're trying to access the database from an IP that isn't whitelisted.
    at _handleConnectionErrors (node_modules/mongoose/lib/connection.js:791:11)
    at NativeConnection.openUri (node_modules/mongoose/lib/connection.js:766:11)
    reason: TopologyDescription {
      type: 'ReplicaSetNoPrimary',
      servers: Map(3) {
        'cluster0-shard-00-00.mongodb.net:27017' => ServerDescription { error: connection timed out }
      }
    }`
  },
  {
    id: 'python-nameerror',
    label: 'Python NameError',
    technology: 'Python',
    icon: '🐍',
    description: 'Undefined variable reference in function scope',
    error: `Traceback (most recent call last):
  File "data_processor.py", line 42, in process_user_metrics
    summary_report = calculate_average(raw_scores) + total_offset
NameError: name 'total_offset' is not defined. Did you mean: 'total_count'?`
  },
  {
    id: 'java-npe',
    label: 'Java NullPointerException',
    technology: 'Java',
    icon: '☕',
    description: 'Attempting to invoke method on null object reference',
    error: `Exception in thread "main" java.lang.NullPointerException: Cannot invoke "com.app.service.UserProfile.getEmail()" because "this.profile" is null
    at com.app.service.NotificationService.sendWelcomeEmail(NotificationService.java:38)
    at com.app.controller.RegistrationController.registerUser(RegistrationController.java:54)
    at com.app.Application.main(Application.java:21)`
  },
  {
    id: 'cpp-compile-error',
    label: 'C++ Compile Error',
    technology: 'C++',
    icon: '⚙️',
    description: 'Invalid operands to binary expression (std::string vs int)',
    error: `main.cpp:24:19: error: no match for 'operator+' (operand types are 'std::string' {aka 'std::__cxx11::basic_string<char>'} and 'int')
   24 |     std::string res = message + status_code;
      |                       ~~~~~~~ ^ ~~~~~~~~~~~
      |                       |         |
      |                       |         int
      |                       std::string {aka std::__cxx11::basic_string<char>}
note: candidate: 'operator+(const std::string&, const std::string&)' (argument 2 cannot be converted from 'int' to 'const std::string&')`
  },
  {
    id: 'react-render-error',
    label: 'React Render Error',
    technology: 'React',
    icon: '⚛️',
    description: 'Objects are not valid as a React child error',
    error: `Error: Objects are not valid as a React child (found: object with keys {id, name, role}). If you meant to render a collection of children, use an array instead.
    at throwOnInvalidObjectType (react-dom.development.js:14887:9)
    at reconcileChildFibers (react-dom.development.js:15824:7)
    at reconcileChildren (react-dom.development.js:19167:28)
    at UserCard (UserCard.jsx:12:5)`
  },
  {
    id: 'sql-syntax-error',
    label: 'SQL Syntax Error',
    technology: 'SQL',
    icon: '🗄️',
    description: 'Syntax error near group by clause in aggregated query',
    error: `ERROR: 42601: syntax error at or near "WHERE"
LINE 4:  WHERE created_at >= NOW() - INTERVAL '30 days'
         ^
QUERY: SELECT department_id, AVG(salary) AS avg_sal
       FROM employees
       GROUP BY department_id
       WHERE created_at >= NOW() - INTERVAL '30 days'
       HAVING AVG(salary) > 50000;`
  }
];

export const STORAGE_KEYS = {
  HISTORY: 'ai_error_helper_history_v1',
  AUTO_SAVE: 'ai_error_helper_autosave_v1'
};
