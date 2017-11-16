import React, { Component } from 'react';
import {
	Platform,
	StyleSheet,
	TouchableWithoutFeedback,
	View
} from 'react-native';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/Ionicons';

import {
	FormInputLabel,
	FormInputRow
} from './text-input';


export class FormToggle extends Component {
	constructor(props) {
		super(props);
		
		const { active } = props;

		this.state = { active: typeof(active) !== 'undefined' ? active : false }
	}

	componentWillReceiveProps(next_props) {
		const { active } = next_props;

		if (typeof(active) !== 'undefined' && active !== this.state.active) {
			this.setState({ active }, () => {
				this.onToggle(this.state.active);
			});
		}
	}

	onToggle = (active) => {
		if (typeof(this.props.onToggle) === 'function') {
			this.props.onToggle(this.props.name, this.props.value, active, this.props.type);
		}
	}

	toggleInput = () => {
		if (this.props.noToggle && this.state.active) {
			return;
		}

		this.setState({ active: !this.state.active }, () => {
			if (typeof(this.props.onPress) === 'function') {
				this.props.onPress(this.props.name, this.props.value, this.state.active, this.props.type, this.onToggle);
			}
		});
	}

	setActive(active) {
		this.setState({ active });
	}

	isActive() {
		return this.state.active;
	}

	render() {
		const {
			activeColor: active_color,
			activeIcon: active_icon,
			error,
			errorTextColor: error_txt_color,
			iconSize: icon_size,
			inactiveColor: inactive_color,
			inactiveIcon: inactive_icon,
			style,
			textColor: txt_color,
			textStyle: txt_style,
			label,
			...other_props
		} = this.props;
		const label_txt = error ? error_txt_color : txt_color;
		const prefix = Platform.OS === 'ios' ? 'ios' : 'md';

		return (
			<View style={[ styles.main_wrapper, style ]} {...other_props}>
				<TouchableWithoutFeedback onPress={this.toggleInput}>
					<View style={[ styles.content_wrapper ]}>
						<View style={[ styles.checkbox, { height: icon_size } ]}>
							<Icon
								size={icon_size}
								color={this.state.active ? active_color : inactive_color}
								name={this.state.active ? `${prefix}-${active_icon}` : `${prefix}-${inactive_icon}`}
							/>
						</View>
						{label && <FormInputLabel label={label} style={[ styles.label, txt_style, { color: label_txt } ]} />}
					</View>
				</TouchableWithoutFeedback>
			</View>
		)
	}
}

export const createFormToggle = (options = {}, display_name) => {
	class Container extends Component {
		constructor(props) {
			super(props);
		}

		isActive() {
			return this.toggle.isActive();
		}

		onToggle(active) {
			this.toggle.onToggle(active);
		}

		setActive(active) {
			this.toggle.setActive(active);
		}

		render() {
			const combined_props = Object.assign({}, this.props, options);

			return <FormToggle {...combined_props} ref={(el) => this.toggle = el} />
		}
	}

	Container.displayName = display_name || 'FormCheckbox';

	return Container;
}

export const FormCheckbox = createFormToggle();
export const FormRadioBtn = createFormToggle({ activeIcon: 'radio-button-on', inactiveIcon: 'radio-button-off', noToggle: true, type: 'radio' }, 'FormRadioBtn');

FormToggle.propTypes = {
	activeColor: PropTypes.string,
	activeIcon: PropTypes.string,
	error: PropTypes.bool,
	errorTextColor: PropTypes.string,
	iconSize: PropTypes.number,
	inactiveColor: PropTypes.string,
	inactiveIcon: PropTypes.string,
	multiselect: PropTypes.bool,
	name: PropTypes.string.isRequired,
	noToggle: PropTypes.bool,
	onPress: PropTypes.func,
	textColor: PropTypes.string,
	textStyle: PropTypes.object,
	type: PropTypes.string,
	value: PropTypes.any.isRequired
};

FormToggle.defaultProps = {
	activeColor: '#3B4752',
	activeIcon: 'checkbox',
	errorTextColor: '#FF0000',
	iconSize: 20,
	inactiveColor: '#CCCCCC',
	inactiveIcon: 'square-outline',
	multiselect: false,
	noToggle: false,
	textColor: '#3B4752',
	type: 'checkbox'
};

export const FormToggleGroupLabel = (props) => {
	const {
		children,
		label,
		style,
		txtStyle, txt_style,
		...other_props
	} = props;
	const label_txt = children || label;

	if (label_txt) {
		return (
			<View style={[ styles.main_wrapper, style ]} {...other_props}>
				<View style={styles.content_wrapper}>
					<FormInputLabel label={label_txt} style={[ styles.label, style.color && { color: style.color }, txt_style ]} />
				</View>
			</View>
		);
	} else {
		return null;
	}
}

const styles = StyleSheet.create({
	checkbox: {
		marginRight: 5
	},
	content_wrapper: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center'
	},
	main_wrapper: {
		height: 25,
		marginRight: 5,
		marginLeft: 5
	},
	label: {
		paddingBottom: 0,
		color: '#3B4752',
		fontSize: 14,
		fontWeight: '500'
	}
});
