import React, { Component } from 'react';
import { View } from 'react-native';
import {
	get,
	isArray,
	isBoolean,
	isEqual,
	isEmpty,
	isObject,
	isString,
	map,
	omit,
	reduce,
	uniqBy,
	without
} from 'lodash';

import {
	FormEmailInput,
	FormInputLabel,
	FormInputRow,
	FormNumberInput,
	FormPasswordInput,
	FormPhoneInput,
	FormTextArea,
	FormTextInput
} from './elements/text-input';
import {
	FormCheckbox,
	FormRadioBtn,
	FormToggleGroupLabel
} from './elements/form-toggle';

const exists = (value) => typeof(value) !== 'undefined' && value !== null && value !== false;

export default class Formasaurus extends Component {
	constructor(props) {
		super(props);

		/**
			DEFAULT STATE EXAMPLE:
			{
				errors: {},
				required: [],
				values: {}
			}
		**/

		this.state = {
			errors: {},
			...this.setInputValues(props.children)
		};

	}

	static Checkbox = FormCheckbox;
	static EmailInput = FormEmailInput;
	static InputRow = FormInputRow;
	static InputLabel = FormInputLabel;
	static NumberInput = FormNumberInput;
	static PasswordInput = FormPasswordInput;
	static PhoneInput = FormPhoneInput;
	static RadioBtn = FormRadioBtn;
	static TextArea = FormTextArea;
	static TextInput = FormTextInput;
	static ToggleGroupLabel = FormToggleGroupLabel;

	componentWillReceiveProps(next_props) {
		const {
			children,
			errors
		} = next_props;

		if (exists(children)) {
			const new_values = this.setInputValues(children);

			if (!isEqual(new_values.dynamic_values, this.state.dynamic_values)) {
				this.setState({ ...new_values });
			}
		}

		if (exists(errors)) {
			if (!isEqual(errors, this.state.errors)) {
				this.setState({ errors });
			}
		}
	}

	focusNextField = (next) => {
		const next_field = this[`${next}_input`];

		if (next_field) {
			next_field.focus();
		}
	}

	buildForm(children, inputs = []) {
		return React.Children.map(children, (child, i) => {
			if (!child || !exists(child.props)) {
				return;
			} else {
				const {
					active,
					children,
					multiselect,
					name,
					next,
					onPress,
					type,
					value
				} = child.props;
				let child_props = {};

				if (name) {
					const state_val_exists = exists(this.state.values);

					child_props.error = exists(this.state.errors[name]);

					if (type === 'text') {
						child_props.ref = (el) => this[`${name}_input`] = el;
						child_props.value = this.state.values[name];
						child_props.onChangeText = this.updateTxtValue.bind(this, name);

						if (next) {
							child_props.returnKeyType = 'next';
							child_props.onSubmitEditing = this.focusNextField.bind(this, next);
							child_props.blurOnSubmit = false;
						}
					} else {
						child_props.ref = (el) => this[`${name}_${value}_input`] = el;

						if (multiselect) {
							child_props.onPress = this.updateMulitValue;

							if (state_val_exists && active) {
								child_props.active = this.state.values[name].indexOf(value) > -1;
							}
						} else {
							child_props.onPress = this.updateSingleValue;

							if (state_val_exists && active) {
								child_props.active = this.state.values[name] === value;
							}
						}
					}
				}

				if (children) {
					child_props.children = typeof(children) === 'string' ? children : this.buildForm(children);
				}
				return React.cloneElement(child, child_props)
			}
		});
	}

	getErrors() {
		return this.validate().errors;
	}

	clearValues() {
		const clearValue = (obj, val, key) => {
			obj[key] = isArray(val) ? [] : null;
			return obj;
		};

		this.setState({
			dynamic_values: reduce(this.state.dynamic_values, clearValue, {}),
			values: reduce(this.state.dynamic_values, clearValue, {}),
		});
	}

	processValues(values) {
		return reduce(values, (obj, val, key) => {
			if (typeof(val) !== 'undefined' && val !== null && (!isArray(val) || isArray(val) && val.length)) {
				obj[key] = val;
			}
			return obj;
		}, {});
	}

	getValues() {
		return this.processValues(this.state.values);
	}

	setInputValues(children, inputs = { dynamic_values: {}, values: {}, required: [] }) {
		React.Children.forEach(children, (child, i) => {

			if (!child || !exists(child.props)) {
				return;
			} else {
				// console.log(child);
				const {
					active,
					children,
					multiselect,
					name,
					required,
					rules,
					type,
					value
				} = child.props;

				if (children && typeof(children) !== 'string') {
					return this.setInputValues(children, inputs);
				} else if (name) {
					if (type === 'text') {
						const dynamic_val = get(this.state, `dynamic_values.${name}`, null);
						inputs.dynamic_values[name] = value || null;

						/**
							This updates the dynamic "outside" value if it changes
							from the original render. Otherwise use the internal
							value that would be more up to date if the outside state
							hasn't changed this value yet.
						**/
						if (!dynamic_val || dynamic_val !== value) {
							inputs.values[name] = value;
						} else {
							inputs.values[name] = get(this.state, `values.${name}`, null);
						}

					} else if (multiselect) {
						const dynamic_val = get(this.state, `dynamic_values.${name}`, []);
						const val_exists = dynamic_val.indexOf(value) > -1;
						const input_ref = this[`${name}_${value}_input`];
						// Values only get pushed into 'dynamic_values' if 'active is set in the view.'
						if (active) {
							let dynamic_values = inputs.dynamic_values[name];
							inputs.dynamic_values[name] = dynamic_values && dynamic_values.length ? [ ...dynamic_values, value ] : [ value ];
						}

						if ((active && !val_exists) || (!active && val_exists)) {
							//outside changed
							// console.log(`checkbox ${value} = ${active}`)
							exists(input_ref) && input_ref.setActive(active);

							if (active) {
								const input_values = inputs.values[name];

								inputs.values[name] = input_values && input_values.length ? [ ...input_values, value ] : [ value ];
							}
						} else {
							//check for inside change
							if (exists(input_ref) && input_ref.isActive()) {
								const input_values = inputs.values[name];

								inputs.values[name] = input_values && input_values.length ? [ ...input_values, value ] : [ value ];
							} else {
								inputs.values[name] = inputs.values[name] || [];
							}
						}

					} else {
						const dynamic_val = get(this.state, `dynamic_values.${name}`, null);
						const val_exists = dynamic_val === value;
						const input_ref = this[`${name}_${value}_input`];

						if (active) {
							inputs.dynamic_values[name] = value;
						}

						if ((active && !val_exists) || (!active && val_exists)) {
							//outside changed
							// console.log(`single select ${value} = ${active}`)
							exists(input_ref) && input_ref.setActive(active);

							if (active) {
								inputs.values[name] = value;
							}
						} else {
							//check for inside change
							if (exists(input_ref) && input_ref.isActive()) {
								inputs.values[name] = value;
							} else {
								inputs.values[name] = inputs.values[name] || null;
							}
						}
					}

					if (required) {
						let inner_rules = [ { test: 'exists', msg: 'Field is required.' } ];
						if (isArray(rules)) {
							inner_rules = [ ...rules, ...inner_rules ];
						} else if (isObject(rules)) {
							inner_rules = [ rules, ...inner_rules ];
						}

						inputs.required = uniqBy([ ...inputs.required, { name, type, rules: uniqBy(inner_rules, 'test') } ], 'name');
					}
				}
			}
		});

		return {
			dynamic_values: { ...inputs.dynamic_values },
			values: { ...inputs.values },
			required: [ ...inputs.required ]
		};
	}

	getNewValuesState(new_vals = {}) {
		return Object.assign({}, this.state.values, new_vals);
	}

	// togglePressed = (onPress, name, value, active, type) => {
	// 	console.log
	// 	if (typeof(onPress) === 'function') {
	// 		onPress(name, value, active, type);
	// 	}
	// }

	updateMulitValue = (name, value, active, type, callback) => {
		let new_values = this.getNewValuesState();
		const val_exists = new_values[name].indexOf(value) > -1;

		if (active && !val_exists) {
			new_values = this.getNewValuesState({ [name]: [ ...new_values[name], value ] });
		} else if (val_exists) {
			new_values = this.getNewValuesState({ [name]: without(new_values[name], value) });
		}

		this.setState({ values: new_values }, () => callback(active));
	}

	updateSingleValue = (name, value, active, type, callback) => {
		const current_val = this.state.values[name];
		const current_input = this[`${name}_${current_val}_input`];
		const val_exists = current_val === value;

		if (active && !val_exists) {
			current_input && current_input.setActive(false);
			this.setState({ values: this.getNewValuesState({ [name]: value }) }, () => callback(active));
		} else if (type === 'checkbox' && !active) {
			this.setState({ values: this.getNewValuesState({ [name]: isBoolean(value) ? false : null }) }, () => callback(active));
		}
	}

	updateTxtValue = (name, text) => {
		const new_state = this.getNewValuesState({ [name]: text });

		this.setState({ values: new_state });
	}

	getErrorMessage(errors) {
		return map(errors, (error) => {
			if (isArray(error)) {
				return this.getErrorMessage(error);
			} else {
				return error;
			}
		}).join('\n');
	}

	validate() {
		const errors = this.state.required.reduce((obj, input) => {
			const { name } = input;

			const invalid = input.rules.filter((rule) => {
				const { test, msg } = rule;
				const input_val = this.state.values[name];

				if ((typeof(test) === 'function' && !test(input_val)) || (typeof(test) === 'string' && !this.validateValue(this.state.values[name], test))) {
					return msg || { msg: 'Field is invalid.'};
				}
			});

			if (invalid.length) {
				obj[name] = invalid.map((rule) => rule.msg).join('\n')
			}

			return obj;
		}, {});

		this.setState({ errors });

		return {
			errors,
			error_msg: this.getErrorMessage(errors),
			valid: isEmpty(errors)
		}
	}

	notBlank(value) {
		/**
			If the value is not undefined or null
			AND if it's an array it has length
			AND if it's a string it's not blank space.
		**/
		return (typeof(value) !== 'undefined' && value !== null && (!isArray(value) || isArray(value) && value.length) && (!isString(value) || isString(value) && value.trim() !== ''));
	}

	validateValue(value, rule) {
		const rule_args = rule.split(':');
		let valid = false;

		if (this.notBlank(value)) {
			switch (rule_args[0]) {
			case 'email':
				const email_check = new RegExp("[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?");

				valid = email_check.test(value);
				break;
			case 'zipcode':
				const zip_check = new RegExp("\\d{5}-?(\\d{4})?");

				valid = zip_check.test(value);
				break;
			case 'tel':
				const tel_check = new RegExp("^\\+?1?.?[(]{0,1}[0-9]{3}[)]{0,1}[-\\s\\.]{0,1}[0-9]{3}[-\\s\\.]{0,1}[0-9]{4}$");

				valid = tel_check.test(value);
				break;
			case 'equals':
				valid = value.trim() === this.state.values[rule_args[1]].trim();
				break;
			case 'min':
				valid = value.length >= parseInt(rule_args[1], 10);
				break;
			case 'max':
				valid = value.length <= parseInt(rule_args[1], 10);
				break;
			default:
				valid = true;
				break;
			}
		}

		return valid;
	}

	render() {
		// console.log(this.state)
		const {
			children,
			...other_props
		} = this.props;

		return (
			<View {...other_props}>
				{this.buildForm(children)}
			</View>
		)
	}
}
