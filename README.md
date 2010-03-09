DynamicTextarea
===========
Purpose: Provides a lightweight plugin for the textarea tag that dynmically resizes based on its content that has no UI glitches or quirks

[Demo](http://enmassellc.com/misc/dynamicTextarea.html "Demo")
![Screenshot 1](http://dl.dropbox.com/u/18782/dynamicTextarea.jpg)

How to use
----------
DynamicTextarea is a reusable class that can by applied to any textarea tag on a page, with any sort of CSS styling attached to it.

It is recommended that you surround the textarea with a display:block type container to ensure ux integrity.

Constructor:

	new DynamicTextarea(el,options);
	//el: A dom node or id string.
	//options: an object containing key:value pairs for configuring the class. Check the source for more details on available options
	
In Context:

	var input = new DynamicTextarea($('myInput'),{
		min_rows:2,
		max_length:1000
	});

This will ensure the textarea is always at least 2 rows tall, and only allows for a total of 1000 characters (currently broken in IE).

Known Issues
-----------------

Internet Explorer does not respect the max_length option, yet.