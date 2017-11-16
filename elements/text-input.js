import React, { Component } from 'react';
import {
	StyleSheet,
	Text,
	TextInput,
	View
} from 'react-native';
import PropTypes from 'prop-types';
import Color from 'color-js';

export const FormInputLabel = (props) => {
	const {
		children,
		label,
		style,
		...other_props
	} = props;

	if (label) {
		return <Text style={[ styles.label, style ]} numberOfLines={1} ellipsizeMode={'tail'} {...other_props}>{children || label}</Text>
	} else {
		return null;
	}
}

export class FormTextInput extends Component {
	constructor(props) {
		super(props);
	}

	focus() {
		this.textInput.focus();
	}

	render() {
		const {
			bgColor: bg_color,
			bgOpacity: bg_opacity,
			columns,
			error,
			errorBGColor: error_bg_color,
			errorTextColor: error_txt_color,
			placeholderErrorTextColor: error_place_txt,
			placeholderTextColor: place_txt,
			style,
			textColor: txt_color,
			textStyle: txt_style,
			label,
			wrapperStyle: wrapper_style,
			...other_props
		} = this.props;
		const input_txt = error ? error_txt_color : txt_color;
		const input_place_txt = error ? error_place_txt : place_txt;
		let wrapper_bg = bg_color === 'transparent' ? 'transparent' : Color(bg_color).setAlpha(bg_opacity).toRGB();

		if (error) {
			wrapper_bg = bg_color === 'transparent' ? 'transparent' : Color(error_bg_color).setAlpha(bg_opacity).toRGB();
		}

		return (
			<View style={[ styles.wrapper, { flex: columns }, wrapper_style ]}>
				{label && <FormInputLabel label={label} />}
				<View style={[ { backgroundColor:  wrapper_bg, borderRadius: 3 }, style ]}>
					<TextInput
						ref={(el) => this.textInput = el}
						style={[
							styles.input,
							{ color: input_txt },
							txt_style
						]}
						placeholderTextColor={input_place_txt}
						{...other_props}
					/>
				</View>
			</View>
		)
	}
}

FormTextInput.propTypes = {
	bgColor: PropTypes.string,
	bgOpacity: PropTypes.number,
	columns: PropTypes.number,
	error: PropTypes.bool,
	errorBGColor: PropTypes.string,
	errorTextColor: PropTypes.string,
	name: PropTypes.string.isRequired,
	placeholderErrorTextColor: PropTypes.string,
	placeholderTextColor: PropTypes.string,
	textColor: PropTypes.string,
	textStyle: PropTypes.object,
	type: PropTypes.string,
	wrapperStyle: PropTypes.object
};

FormTextInput.defaultProps = {
	autoCorrect: false,
	bgColor: '#FFFFFF',
	bgOpacity: 1,
	border: false,
	columns: 1,
	errorBGColor: '#FFCCCC',
	errorTextColor: '#FF0000',
	placeholderErrorTextColor: '#FFFFFF',
	placeholderTextColor: '#999999',
	secureTextEntry: false,
	textColor: '#3B4752',
	type: 'text',
	underlineColorAndroid: 'rgba(0,0,0,0)'
};

export const createTextInput = (options = {}, display_name) => {
	class Container extends Component {
		constructor(props) {
			super(props);
		}

		focus() {
			this.textInput.focus();
		}

		render() {
			const combined_props = Object.assign({}, this.props, options);
			return <FormTextInput {...combined_props} ref={(el) => this.textInput = el} />
		}
	}

	Container.displayName = display_name || 'FormTextInput';

	return Container;
}

export const FormTextArea = createTextInput({ multiline: true, textStyle: { height: 100 } }, 'FormTextArea');
export const FormEmailInput = createTextInput({ autoCapitalize: 'none', keyboardType: 'email-address' }, 'FormEmailInput');
export const FormPasswordInput = createTextInput({ autoCapitalize: 'none', secureTextEntry: true }, 'FormPasswordInput');
export const FormPhoneInput = createTextInput({ autoCapitalize: 'none', keyboardType: 'phone-pad' }, 'FormPhoneInput');
export const FormNumberInput = createTextInput({ autoCapitalize: 'none', keyboardType: 'numeric' }, 'FormNumberInput');


export const FormInputRow = (props) => {
	const {
		children,
		style,
		...other_props
	} = props;

	return (
		<View style={[ styles.input_row, style ]} {...other_props}>{children}</View>
	)
}

const styles = StyleSheet.create({
	input: {
		height: 40,
		paddingLeft: 5,
		paddingRight: 5,
		fontSize: 14,
		lineHeight: 2
	},
	wrapper: {
		marginRight: 5,
		marginLeft: 5
	},
	input_row: {
		marginRight: -5,
		marginBottom: 10,
		marginLeft: -5,
		flexDirection: 'row',
		alignItems: 'flex-end'
	},
	label: {
		paddingBottom: 5,
		color: '#3B4752',
		fontSize: 14,
		fontWeight: '500'
	}
});
