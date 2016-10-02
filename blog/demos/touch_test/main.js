var g_canvas = document.getElementById ("canvas");
g_canvas.addEventListener ("mousedown", mouse_down, false);
g_canvas.addEventListener ("mousemove", mouse_xy, false);
g_canvas.addEventListener ("mouseup", mouse_up, false);
g_canvas.addEventListener ("touchstart", touch_down, false);
g_canvas.addEventListener ("touchmove", touch_xy, false);
g_canvas.addEventListener ("touchend", touch_up, false);

var g_mouse_down = 0;
var g_touch_down = 0;
/* TODO: array of these for multi-touch */
var g_canvas_x = 0;
var g_canvas_y = 0;

function mouse_up () {
	g_mouse_down = 0;
	show_pos ();
}

function mouse_down () {
	g_mouse_down = 1;
	show_pos ();
}

function touch_up () {
	g_touch_down = 0;
	show_pos ();
}

function touch_down () {
	g_touch_down = 1;
	show_pos ();
}

function mouse_xy (e) {
	if (!e) {
		var e = event;
	}
	e.preventDefault();
	g_canvas_x = e.pageX - g_canvas.offsetLeft;
	g_canvas_y = e.pageY - g_canvas.offsetTop;
	show_pos ();
}

function touch_xy (e) {
	if (!e) {
		var e = event;
	}
	e.preventDefault ();
	g_canvas_x = e.targetTouches[0].pageX - g_canvas.offsetLeft;
	g_canvas_y = e.targetTouches[0].pageY - g_canvas.offsetTop;
	show_pos ();
}

function show_pos () {
	var blurb = document.getElementById ("blurb");
	var str = "pos: (" + g_canvas_x + "," + g_canvas_y + ")<br />";
	str += "mouse_down: " + g_mouse_down + "<br />";
	str += "touch_down: " + g_touch_down;
	blurb.innerHTML = str;
}
