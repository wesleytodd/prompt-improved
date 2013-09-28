# Prompts Improved

Node.js promots like you always wanted.  Style them to your heart's content using [Chalk](https://github.com/sindresorhus/chalk), an amazing CLI package for colors and text styling.  Features include:

- Default options
- Input validation (using regexe's or functions)
- Input filters (both before validation and after)
- Required fields
- Input attempt limits (think limiting password tries)
- Ask single or multiple questions
- When asking multiple questions, subsequent questions can be dependant on previous input.  This allows for simple prompt path logic.
- Configurable prefixs and suffixes
- Custom error messaging
- Input timeouts
- Per-prompt configuration
- Convient error handeling
- 100% test coverage
- (Coming Soon) Multiple choice questions

# Examples

Just ask your user a question:

```javascript
var Prompt = require('prompt-imporved');

var prompt = new Prompt({
	// Some options for all prompts
	prefix: '[?] ',
	prefixTheme: Prompt.chalk.green
});

prompt.ask('Where in the world is Carmen Sandiego?', function(err, res) {
	if (err) return console.error(err); // err is null if no errors
	console.log('Response: ' + res);
});

// Outputs: [?] Where in the world is Carmen Sandiego?: 
```

Options can be provided for all prompts or overridden on a per-prompt basis:

```javascript
var Prompt = require('prompt-imporved');

var prompt = new Prompt({
	suffix: '? '
});

prompt.ask('How is your day going beautiful', function(err, res) {
	if (err) return console.error(err);
	console.log('Response: ' + res);
});

// Outputs: How is your day going beautiful?  
```

Asking multiple questions:

```javascript
var Prompt = require('prompt-imporved');
var prompt = new Prompt();
prompt.ask([{
	question: 'Who\'s your daddy?',
	key: 'father',
}, {
	question: 'What is your Mothers name?',
}], function(err, res) {
	if (err) return console.error(err);
	console.log('Father\'s name: ' res.father);
	console.log('Mother\'s name: ' res['What is your Mothers name?']);
});
```

Full example will all options:

```javascript
var Prompt = require('prompt-imporved');

// These are all the defaults
var prompt = new Prompt({
	prefix        : '',
	suffix        : ': ',
	defaultPrefix : ' (',
	defaultSuffix : ')',
	textTheme     : Prompt.chalk.bold,
	prefixTheme   : Prompt.chalk.white,
	suffixTheme   : Prompt.chalk.white,
	defaultTheme  : Prompt.chalk.white,
	inputError    : 'Error encountered, try again.',
	requiredError : 'Required! Try again.',
	invalidError  : 'Invalid input: ',
	attemptsError : 'Maximum attempts reached!',
	stdin         : process.stdin,
	stdout        : process.stdout,
	stderr        : process.stderr,
	timeout       : null
});

// Each question can have it's own options
prompt.ask([{
	question: 'A yes or no question',
	key: 'answer-key',
	attempts: 3,
	required: true,
	default: 'Y',
	validate: /^(?:y(?:es)?|n(?:o)?)$/i,
	after: function(value) {
		value = value.toLowerCase();
		if (value === 'y' || value === 'yes') return true;
		return false;
	}
}{
	question: 'Something where the first letter should be uppercase',
	key: 'answer-key1',
	before: function(val) {
		return val.charAt(0).toUpperCase() + val.slice(1);
	},
	depends: function(answers) {
		return !!answers['answer-key'];
	}
}], function(err, res) {
	if (err) return console.error(err);
	console.log('Response: ' + res);
});
```

# Tests

Unit tests and test coverage are available:

```
// runs the tests and watches for file changes
$ grunt 

// Runs the coverage generator and opens your borwser to the results
$ grunt coverage
```

# Contributions

Please contribute.  Please make pull requests against the develop branch.
