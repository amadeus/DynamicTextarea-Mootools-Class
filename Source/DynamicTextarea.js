/*
---
description: DynamicTextarea

license: MIT-style

authors:
- Amadeus Demarzi (http://enmassellc.com/)

requires:
 core/1.3: '*'

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
		// onFocus:$empty,
		// onBlur:$empty,
		// onKeyPress:$empty,
		// onResize:$empty,
		// onLoad:$empty,
		// onEnable:$empty,
		// onDisable:$empty
	},

	textarea:null,

	initialize:function(textarea,options) {
		this.setOptions(options);
		this.textarea = document.id(textarea);
		if (!this.textarea) return;

		// Firefox handles scroll heights differently than all other browsers
		if (window.Browser.firefox) {
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

		this.textarea.set({
			'rows':1,
			'styles': {
				'resize':'none', // Disable browser resize handles
				'-moz-resize':'none',
				'-webkit-resize':'none',
				'-o-resize':'none',
				'position':'relative',
				'display':'block',
				'overflow':'hidden',
				'height':'auto'
			}
		});

		// Prebind common methods
		['focus','delayCheck','blur','scrollFix','checkSize','clean','disable','enable','getLineHeight'].each(function(method){
			this[method] = this[method].bind(this);
		},this);

		// This is the only crossbrowser method to determine scrollheight of a single line in a textarea
		this.getLineHeight();
		
		this.fireEvent('load');

		// Set the height of the textarea, based on content
		this.checkSize(true);
		this.textarea.addEvent('focus',this.focus);
	},
	
	getLineHeight:function(){
		var backupValue = this.textarea.value;
		this.textarea.value = 'M';
		this.options.lineHeight = this.textarea.getScrollSize().y - this.options.padding;
		this.textarea.value = backupValue;
		this.textarea.setStyle('height', this.options.lineHeight * this.options.minRows);
	},

	// For Safari (mostly), stops a small jump on textarea resize
	scrollFix: function(){
		this.textarea.scrollTo(0,0);
	},

	// Sets up textarea to be interactive, and calls focus event
	focus: function(){
		this.textarea.addEvents({
			'keydown':this.delayCheck,
			'keypress':this.delayCheck,
			'blur':this.blur,
			'scroll':this.scrollFix
		});
		this.fireEvent('focus');
	},

	// Sets appropriate blur classes and calls user binded blur
	blur: function(){
		this.textarea.removeEvents({
			'keydown':this.delayCheck,
			'keypress':this.delayCheck,
			'blur':this.blur,
			'scroll':this.scrollFix
		});
		this.fireEvent('blur');
	},

	// Delay start of check because text hasn't been injected into the textarea yet
	delayCheck: function(){
		if (this.options.delay === true)
			this.options.delay = this.checkSize.delay(1);
	},

	// Check size of the textarea, to determine if it needs to be resized or not, and resize if necessary
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

	// Clean out this textarea's event handlers
	clean: function(){
		this.textarea.removeEvents({
			'focus':this.focus,
			'keydown':this.delayCheck,
			'keypress':this.delayCheck,
			'blur':this.blur,
			'scroll':this.scrollFix
		});
	},

	// Disable input for the textarea
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

	// Enable input for the textarea
	enable: function(){
		this.textarea.addEvents({
			'focus':this.focus,
			'scroll':this.scrollFix
		});
		this.textarea.set(this.options.disabled,false);
		this.fireEvent('enable');
	}
});