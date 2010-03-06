DynamicTextarea
===========
Purpose: Provides a lightweight plugin for the <textarea> tag that dynmically resizes based on its content that has no UI glitches or quirks

http://enmassellc.com/misc/dynamicTextarea.html

How to use
----------

We expect this section for every plugin. It just explains how to use your plugin.
Never should a plugin rely on a 3rd party link to explain its behavior or functionality. We need this to ensure that if a website is removed or becomes inaccessible, people can still enjoy your plugins' functionality.

It often includes code snippets, which are just indented pieces of text:

	var script = new MyScript()
	script.doSomething();
	

DynamicTextarea is a reusable class that can by applied to any <textarea> tag on a page, with any sort of CSS styling attached to it.

It is recommended that you surround the <textarea> with a display:block type container to ensure ux integrity.

Constructor
	new DynamicTextarea(el,options);
	//el: A dom node or id string
	//options: an object containing key:value pairs for configuring the class. Check the source for more details on available options
	
In Context:
	var input = new DynamicTextarea($('myInput'),{
		min_rows:2,
		max_length:1000
	});

This will ensure the <textarea> is always at least 2 rows tall, and only allows for a total of 1000 characters (currently broken in IE).

Known Issues
-----------------

Internet Explorer does not respect the max_length option, yet.