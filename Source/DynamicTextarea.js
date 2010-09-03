/*
---
description: DynamicTextarea

license: MIT-style

authors:
- Amadeus Demarzi (http://enmassellc.com/)

requires:
 core/1.2.4+: [Core/Class, Core/Element, Core/Element.Event, Core/Element.Style, Core/Element.Dimensions]

provides: [DynamicTextarea]
...
*/

var DynamicTextarea = new Class({

	Implements:[Options, Events],

	options: {
		value:'',
		minRows:1,
		delay:true,
		lineHeight:null,
		offset:0

		// AVAILABLE EVENTS
		// onInit:$empty,

		// onFocus:$empty,
		// onBlur:$empty,

		// onKeyPress:$empty,
		// onResize:$empty,

		// onEnable:$empty,
		// onDisable:$empty
	},

	textarea:null,

	initialize:function(textarea,options) {
		this.textarea = document.id(textarea);
		if (!this.textarea) return;

		this.setOptions(options);

		// Prebind common methods
		['focus','delayCheck','blur','scrollFix','checkSize','clean','disable','enable','getLineHeight']
			.each(function(method){
				this[method] = this[method].bind(this);
			},this);

		// Firefox and Opera handle scroll heights differently than all other browsers
		if (window.Browser.firefox || window.Browser.opera) {
			this.options.offset =
				parseInt(this.textarea.getStyle('padding-top'),10) +
				parseInt(this.textarea.getStyle('padding-bottom'),10) +
				parseInt(this.textarea.getStyle('border-bottom-width'),10) +
				parseInt(this.textarea.getStyle('border-top-width'),10);
			this.options.padding = 0;
		} else {
			this.options.offset =
				parseInt(this.textarea.getStyle('border-bottom-width'),10) +
				parseInt(this.textarea.getStyle('border-top-width'),10);
			this.options.padding =
				parseInt(this.textarea.getStyle('padding-top'),10) +
				parseInt(this.textarea.getStyle('padding-bottom'),10);
		}

		// Disable browser resize handles, set appropriate styles
		this.textarea.set({
			'rows':1,
			'styles': {
				'resize':'none',
				'-moz-resize':'none',
				'-webkit-resize':'none',
				'position':'relative',
				'display':'block',
				'overflow':'hidden',
				'height':'auto'
			}
		});

		this.getLineHeight();

		this.fireEvent('init');

		// Set the height of the textarea, based on content
		this.checkSize(true);
		this.textarea.addEvent('focus',this.focus);
	},

	// This is the only crossbrowser method to determine ACTUAL lineHeight in a textarea (that I am aware of)
	getLineHeight:function(){
		var backupValue = this.textarea.value;
		this.textarea.value = 'M';
		this.options.lineHeight = this.textarea.getScrollSize().y - this.options.padding;
		this.textarea.value = backupValue;
		this.textarea.setStyle('height', this.options.lineHeight * this.options.minRows);
	},

	// Stops a small scroll jump on some browsers
	scrollFix: function(){
		this.textarea.scrollTo(0,0);
	},

	// Add interactive events, and fire focus event
	focus: function(){
		this.textarea.addEvents({
			'keydown':this.delayCheck,
			'keypress':this.delayCheck,
			'blur':this.blur,
			'scroll':this.scrollFix
		});
		this.fireEvent('focus');
	},

	// Clean out extraneaous events, and fire blur event
	blur: function(){
		this.textarea.removeEvents({
			'keydown':this.delayCheck,
			'keypress':this.delayCheck,
			'blur':this.blur,
			'scroll':this.scrollFix
		});
		this.fireEvent('blur');
	},

	// Delay checkSize because text hasn't been injected into the textarea yet
	delayCheck: function(){
		if (this.options.delay === true)
			this.options.delay = this.checkSize.delay(1);
	},

	// Determine if it needs to be resized or not, and resize if necessary
	checkSize: function(manual) {
		var oldValue = this.options.value;

		this.options.value = this.textarea.value;
		this.options.delay = false;

		if (this.options.value === oldValue && manual!==true)
			return this.options.delay = true;

		if (!oldValue || this.options.value.length < oldValue.length)
			this.textarea.setStyle('height', this.options.minRows * this.options.lineHeight);

		var tempHeight = this.textarea.getScrollSize().y,
			offsetHeight = this.textarea.offsetHeight,
			cssHeight = tempHeight-this.options.padding,
			scrollHeight = tempHeight+this.options.offset;

		if (scrollHeight !== offsetHeight && cssHeight > this.options.minRows * this.options.lineHeight){
			this.textarea.setStyle('height',cssHeight);
			this.fireEvent('resize');
		}

		this.options.delay = true;
		if (manual !== true)
			this.fireEvent('keyPress');
	},

	// Permanently clean out this textarea's event handlers
	clean: function(){
		this.textarea.removeEvents({
			'focus':this.focus,
			'keydown':this.delayCheck,
			'keypress':this.delayCheck,
			'blur':this.blur,
			'scroll':this.scrollFix
		});
	},

	// Disable the textarea
	disable: function(){
		this.textarea.blur();
		this.textarea.removeEvents({
			'focus':this.focus,
			'keydown':this.delayCheck,
			'keypress':this.delayCheck,
			'blur':this.blur,
			'scroll':this.scrollFix
		});
		this.textarea.set(this.options.disabled,true);
		this.fireEvent('disable');
	},

	// Enables the textarea
	enable: function(){
		this.textarea.addEvents({
			'focus':this.focus,
			'scroll':this.scrollFix
		});
		this.textarea.set(this.options.disabled,false);
		this.fireEvent('enable');
	}
});