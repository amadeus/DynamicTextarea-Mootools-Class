/**
 * DynamicTextarea
 * @purpose: Provides a lightweight plugin for the <textarea> tag that dynmically resizes based on its content that has no UI glitches or quirks
 *
 * @copyright: Amadeus Demarzi, 2010
 * @license: MIT-style license.
 * @author: Amadeus Demarzi
 * @requirements: MooTools 1.2, OverText (if a default string is applied), Element.Measure from MooTools More
 *
 * @notes: Wrap the <textarea> in its own div or misc html tag with display:block to ensure integrity of the user experience while the script resizes the textarea
 */
var DynamicTextarea = new Class({
	Implements:[Options,Events],
	options:
	{
		value:'',
		min_rows:1,
		string:'',
		no_breaks:false,
		value:null,
		basic:'default',
		focused:'focused',
		filled:'filled',
		timeout:'ready',
		max_length:null,
		line_height:null,
		offset:0,
		ctaClass:''
		//onShow:$empty,
		//onBlur:$empty,
		//onKeyPress:$empty,
		//onLoad:$empty
	},
	elements:
	{
		input:null,
		parent:null,
		cta:null
	},
	initialize:function(el,options)
	{
		this.setOptions(options);
		var opts = this.options, els = this.elements;
		
		els.input = document.id(el);
		if(!els.input) return;
		
		if(window.Browser.Engine.gecko) // Firefox handles scroll heights differently than all other browsers
		{
			opts.offset = parseInt(els.input.getStyle('padding-top'),10)+parseInt(els.input.getStyle('padding-bottom'),10)+parseInt(els.input.getStyle('border-bottom-width'),10)+parseInt(els.input.getStyle('border-top-width'),10);
			opts.padding = 0;
		}
		else
		{
			opts.offset = parseInt(els.input.getStyle('border-bottom-width'),10)+parseInt(els.input.getStyle('border-top-width'),10);
			opts.padding = parseInt(els.input.getStyle('padding-top'),10)+parseInt(els.input.getStyle('padding-bottom'),10);
		}
		
		els.parent = els.input.getParent();
		if(opts.string!='' && window.OverText)
		{
			els.cta = new OverText(els.input,{
				textOverride:opts.string,
				labelClass:opts.ctaClass
			});
		}
		
		var backupString = '';
		if(els.input.value=='') els.parent.addClass(opts.basic);
		else
		{
			backupString = els.input.value;
			els.parent.addClass(opts.filled);
		}
		
		els.input.set({
			'spellcheck':false,
			'rows':1,
			'styles':
			{
				'resize':'none',
				'position':'relative',
				'display':'block',
				'overflow':'hidden',
				'height':'auto'
			}
		});
		
		els.input.value = 'M';
		opts.line_height = (els.input.measure(function(){ return this.getScrollSize().y; }))-opts.padding;
		els.input.value = backupString;
		els.input.setStyle('height',opts.line_height*opts.min_rows);
		
		// Prebind common methods - I prefer to not require MooTools More Bind, so I am doing it manually
		this.focus = this.focus.bind(this);
		this.delayStart = this.delayStart.bindWithEvent(this);
		this.delayStart = this.delayStart.bindWithEvent(this);
		this.blur = this.blur.bind(this);
		this.scrollFix = this.scrollFix.bind(this);
		this.checkSize = this.checkSize.bind(this);
		this.clean = this.clean.bind(this);
		this.disable = this.disable.bind(this);
		this.enable = this.enable.bind(this);
		
		window.addEvent('unload',this.clean);
		
		this.checkSize(true);
		els.input.addEvent('focus',this.focus);
		this.fireEvent('load');
	},
	
	// For Safari (mostly), stops a small jump on textarea resize
	scrollFix: function(){ this.elements.input.scrollTo(0,0); },
	
	// Sets up textarea to be interactive, and calls user binded focus
	focus:function()
	{
		var opts = this.options, els = this.elements;
		
		els.parent.removeClass(opts.basic);
		els.parent.removeClass(opts.filled);
		els.parent.addClass(opts.focused);
		
		els.input.addEvents({
			'keydown':this.delayStart,
			'keypress':this.delayStart,
			'blur':this.blur,
			'scroll':this.scrollFix
		});
		this.fireEvent('onFocus');
	},
	
	// Set's appropriate blur classes and calls user binded blur
	blur:function()
	{
		var opts = this.options, els = this.elements;
		
		els.parent.removeClass(opts.focused);
		if(els.input.value=='') els.parent.addClass(opts.basic);
		else els.parent.addClass(opts.filled);
		
		els.input.removeEvents({
			'keydown':this.delayStart,
			'keypress':this.delayStart,
			'blur':this.blur,
			'scroll':this.scrollFix
		});
		
		this.fireEvent('onBlur');
	},
	
	// Delay start of check because text hasn't been injected into the textarea yet
	delayStart:function(e)
	{
		var opts = this.options, els = this.elements;
		
		if(opts.timeout=='ready' && opts.value.length<opts.max_length)
		{
			opts.timeout = setTimeout(this.checkSize,1);
			return;
		}
		
		if(	(opts.max_length && opts.max_length!=null &&
			opts.value.length>=opts.max_length &&
			e.key!='backspace' &&
			e.key!='delete' &&
			e.meta==false &&
			e.control==false &&
			e.shift==false &&
			e.key!='up' &&
			e.key!='down' &&
			e.key!='left' &&
			e.key!='right') || (opts.no_breaks==true && (e.key=='enter' || e.key=='return')))
		{
			e.preventDefault();
			return;
		}
		if(opts.timeout=='ready') opts.timeout = setTimeout(this.checkSize,1);
	},
	
	// Set text area to smallest size, and begin adjusting size
	checkSize: function(manual)
	{
		var opts = this.options, els = this.elements, oldVal = opts.value;
		
		opts.value = els.input.value;
		opts.timeout = 0;
		
		if(opts.value==oldVal && manual!=true)
		{
			opts.timeout = 'ready';
			return;
		}
		
		if(oldVal==null || opts.value.length<oldVal.length)
		{
			els.parent.setStyle('height',els.parent.getSize().y);
			els.input.setStyle('height',opts.min_rows*opts.line_height);
		}
		
		var t_height = els.input.getScrollSize().y;
		var offsetHeight = els.input.offsetHeight;
		var cssHeight = t_height-opts.padding;
		var scrollHeight = t_height+opts.offset;
		if(scrollHeight!=offsetHeight && cssHeight>opts.min_rows*opts.line_height) els.input.setStyle('height',cssHeight);
		
		els.parent.setStyle('height','auto');
		opts.timeout = 'ready';
		if(manual!=true) this.fireEvent('onKeyPress');
	},
	
	// Reset the text area to blank
	reset:function()
	{
		var opts = this.options, els = this.elements;
		
		els.input.value = '';
		this.checkSize(true);
		els.parent.removeClass(opts.filled);
		els.parent.removeClass(opts.focused);
		els.parent.addClass(opts.basic);
	},
	
	// Sets the caret to the desired position
	setCaret:function(pos)
	{
		var el = this.elements.input;
		// Standard Browsers
		if (!document.selection)
		{ 
			el.selectionStart = pos;
			el.selectionEnd = pos;
		}
		// For IE
		else
		{
			var sel = document.selection.createRange();
			sel.moveStart('character', -el.value.length);
			sel.moveStart('character', pos);
			sel.moveEnd('character', 0);
			sel.select();
		}
	},
	
	// Clean out this textarea's event handlers
	clean:function()
	{
		this.elements.input.removeEvents({
			'focus':this.focus,
			'keydown':this.delayStart,
			'keypress':this.delayStart,
			'blur':this.blur,
			'scroll':this.scrollFix
		});
		
		window.removeEvent('unload',this.clean);
	},
	
	// Disable input for the textarea
	disable:function()
	{   
		this.elements.input.blur();
		this.elements.input.removeEvents({
			'focus':this.focus,
			'keydown':this.delayStart,
			'keypress':this.delayStart,
			'blur':this.blur,
			'scroll':this.scrollFix
		});
		this.elements.input.set('disabled',true);
		this.elements.parent.addClass('disabled');
		this.fireEvent('disable');
	},
	
	// Enable input for the textarea
	enable:function()
	{
		this.elements.input.addEvents({
			'focus':this.focus,
			'scroll':this.scrollFix
		});
		this.elements.input.set('disabled',false);
		this.elements.parent.removeClass('disabled');
		this.fireEvent('enable');
	}
});