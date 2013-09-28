var readline = require('readline'),
	chalk = require('chalk'),
	read = require('read');

// Utility extend
function extend(obj) {
	var args = Array.prototype.slice.call(arguments, 1);
	for (var i = 0, len = args.length; i < len; i++) {
		if (args[i]) {
			for (var prop in args[i]) {
				obj[prop] = args[i][prop];
			}
		}
	}
    return obj;
};

var Prompt = function(options) {

	// Make sure this is a new instance of the prompt
	if (!(this instanceof Prompt))
		return new Prompt(options);

	// Merge options
	this.options = extend({}, Prompt.defaultOptions, options);
};

// Default options
Prompt.defaultOptions = {
	prefix        : '',
	suffix        : ': ',
	defaultPrefix : ' (',
	defaultSuffix : ')',
	textTheme     : chalk.bold,
	prefixTheme   : chalk.white,
	suffixTheme   : chalk.white,
	defaultTheme  : chalk.white,
	inputError    : 'Error encountered, try again.',
	requiredError : 'Required! Try again.',
	invalidError  : 'Invalid input: ',
	attemptsError : 'Maximum attempts reached!',
	stdin         : process.stdin,
	stdout        : process.stdout,
	stderr        : process.stderr,
	timeout       : null
};

// Provides chalk
Prompt.chalk = chalk;

// Ask a question
Prompt.prototype.ask = function(question, options, callback) {

	// Check callback
	if (typeof callback !== 'function') {
		callback = options;
		options = undefined;
	}

	// ask multiple questions
	if (question instanceof Array) {
		askMultiple.call(this, question, callback);
		return;
	}

	// Can pass question in options
	if (typeof question === 'object') {
		options = question;
		question = options.question;
	}

	// Options are optional
	if (typeof options === 'undefined') {
		options = {};
	}
	askSingle.call(this, question, options, callback);

};

// Ask multiple questions
function askMultiple(questions, callback) {

	var output = {},
		errors = null,
		index = 0,
		len = questions.length,
		me = this;

	// Loop through prompts
	var next = function(err, res) {
		// The key is either specified or just the question
		var key = questions[index].key || questions[index].question;

		// Keep the errors
		if (err != null) {
			if (errors === null) errors = {};
			errors[key] = err;
		}

		// Keep the output
		if (res != null) output[key] = res;

		// If end of questions, callback
		if (index == len-1) {
			callback(errors, output);
			return;
		}

		// Increment and next
		++index;
		askSingle.call(me, questions[index].question, questions[index], next, output);
	};

	// Start the loop
	askSingle.call(this, questions[index].question, questions[index], next, output);
}

// Ask a single question
function askSingle(question, options, callback, _output) {

	// Question and callback are not!
	if (typeof question !== 'string' || typeof callback !== 'function')
		throw new TypeError('Both question and callback are required!');

	// Merge options
	options = extend({}, this.options, options);

	// Prompt depends
	switch (typeof options.depends) {
		case 'boolean':
			if (!options.depends) return callback(null, null);
			break;
		case 'function':
			if (!options.depends(_output)) return callback(null, null);
			break;
	}

	// Build prompt string
	question = promptText(question, options);

	// Ask the question
	askQuestion.call(this, question, options, callback);

};

// Builds the prompt string
function promptText(text, options) {
	if (options.prefix) {
		options.prefix = options.prefixTheme(options.prefix);
	}
	text = options.textTheme(text);
	if (options.default) {
		var def = options.defaultTheme(options.defaultPrefix + options.default + options.defaultSuffix);
	}
	if (options.suffix) {
		options.suffix = options.suffixTheme(options.suffix);
	}

	return options.prefix + text + (def || '') + options.suffix;
};

// Just displays a prompt
function displayPrompt(text, callback) {
	read({
		prompt: text,
		input: this.options.stdin,
		output: this.options.stdout,
		terminal: false,
		timeout: this.options.timeout
	}, callback.bind(this));
};

// The actuall asking
function askQuestion(question, options, callback, _attempt) {
	if (!_attempt) _attempt = 0;
	_attempt++;

	if (options.attempts && _attempt > options.attempts) {
		logError.call(this, options.attemptsError);
		return callback(options.attemptsError, '');
	}

	displayPrompt.call(this, question, function(err, res) {

		if (err) {
			if (_attempt > 2)
				return callback(err+'', '');
			logError.call(this, options.inputError);
			return askQuestion.call(this, question, options, callback, _attempt);
		}

		// Before filter
		if (typeof options.before === 'function') {
			res = options.before(res);
		}

		// If default, assign it if empty
		if (typeof options.default !== 'undefined' && res == '') {
			res = options.default;
		}

		// Required?
		if (options.required && (typeof res === 'undefined' || res == '' || !res)) {
			logError.call(this, options.requiredError);
			return askQuestion.call(this, question, options, callback, _attempt);
		}

		// Custom validation function
		if (typeof options.validate === 'function') {
			if (!options.validate(res)) {
				logError.call(this, options.invalidError + res);
				return askQuestion.call(this, question, options, callback, _attempt);
			}
		} else if (options.validate instanceof RegExp) {
			if (!options.validate.test(res)) {
				logError.call(this, options.invalidError + res);
				return askQuestion.call(this, question, options, callback, _attempt);
			}
		}

		// Before filter
		if (typeof options.after === 'function') {
			res = options.after(res);
		}

		return callback(null, res);
	});
};

function logError(msg) {
	this.options.stderr.write(chalk.red(msg));
};

// Export prompt
module.exports = Prompt;
