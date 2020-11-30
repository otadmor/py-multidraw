
function clean () {
  $.ajax({url:"/clean"});

}
function undo () {
  $.ajax({url:"/undo"});

}

var deltime = 100;
var draw_deltime = 30;

var selected_color = "000000";
var selected_size = 1;
var funqueue = [];
var last_index = 0;
var lines_painted = 0;

function done_read_lines(data)
{
d = $.parseJSON(data);
new_last_index = d[1];
lines_count = d[2];

if (last_index + lines_painted > new_last_index + lines_count)
{

funqueue.push(null);
last_index = 0;lines_painted=0;read_lines();return;}
else
last_index = new_last_index;

lines = d[0];
for (line in lines)
{
lines_painted += 1;

var l = lines[line];
funqueue.push(l);

}
window.setTimeout("read_lines()", deltime);
}

function clear_all(painter, ctx)
{
ctx.clearRect(0, 0, painter.width, painter.height);

}

var opened = false;

var old_spec;
function draw_line(l, painter, ctx)
{

    var cur_spec = [parseInt(l[1]), parseInt(l[2]), l[5], l[6], l[0]];
    if (old_spec && cur_spec.toString() == old_spec.toString()) {
        ctx.lineTo(parseInt(l[3]), parseInt(l[4]));
    } else {
        if (old_spec) {
            ctx.stroke();
            ctx.closePath();
        }
        ctx.beginPath();
        ctx.lineCap = "round";
        ctx.lineWidth = l[6];
        ctx.strokeStyle="#" + l[5];
        ctx.moveTo(parseInt(l[1]), parseInt(l[2]));
        ctx.lineTo(parseInt(l[3]), parseInt(l[4]));
    }
    old_spec = [parseInt(l[3]), parseInt(l[4]), l[5], l[6], l[0]]
}

function draw_all_lines()
{
var painter = document.getElementById("painter");
var ctx = painter.getContext("2d");

    old_spec = undefined;
while (funqueue.length > 0) {
    d = funqueue.shift();
    if (d == null) {
        if (old_spec) {
            ctx.stroke();
            ctx.closePath();
            old_spec = undefined;
        }
        clear_all(painter, ctx);
    }
    else draw_line(d, painter, ctx);
}
    if (old_spec) {
        ctx.stroke();
        ctx.closePath();
    }
    old_spec = undefined;
}


function draw_lines()
{
draw_all_lines();
window.setTimeout("draw_lines()", draw_deltime);
}

function read_lines() {
  $.ajax({url:"/" + (last_index + lines_painted)}).done(done_read_lines);


}

var start_x = 0;
var start_y = 0;
var painter = document.getElementById("painter");
var cur_line = null;
function startline(e)
{
if (navigator.userAgent.indexOf("Firefox")!=-1)
{
end_x = start_x = e.layerX;
end_y = start_y = e.layerY;
}
else
{
end_x = start_x = e.offsetX;
end_y = start_y = e.offsetY;
}
cur_line = lines_count;
var painter = document.getElementById("fore_painter");
painter.onmousemove = moveline;
/*var cont = $("#cont").attr('checked');
if (cont)
{
var painter = document.getElementById("painter");
var ctx = painter.getContext("2d");

ctx.beginPath();
ctx.lineCap = "round";
ctx.strokeStyle="#" + selected_color;
ctx.moveTo(start_x, start_y);

}*/

}
var ee;
var end_x = 0;
var end_y =0;
function moveline(e)
{
    ee=e;


    var cont = $("#radio_2").attr('checked');
    var rectangle=$("#radio_3").attr('checked');
    if (rectangle) {

var painter = document.getElementById("fore_painter");
var ctx = painter.getContext("2d");
var space_width = 2 * selected_size; // should actually be sqrt(2) * selected_size because the max size is given on 45 degrees
ctx.clearRect(Math.min(start_x, end_x) - space_width, Math.min(start_y, end_y) - space_width, Math.max(start_x, end_x) + space_width, Math.max(start_y, end_y) + space_width);

if (navigator.userAgent.indexOf("Firefox")!=-1)
{
end_x = e.layerX;
end_y = e.layerY;

}
else
{
end_x = e.offsetX;
end_y = e.offsetY;
}

ctx.beginPath();
ctx.lineCap = "round";
ctx.lineWidth = selected_size;
ctx.strokeStyle="#" + selected_color;
ctx.moveTo(start_x, start_y);
ctx.lineTo(end_x, start_y);
ctx.lineTo(end_x, end_y);
ctx.lineTo(start_x, end_y);
ctx.lineTo(start_x, start_y);
ctx.stroke();
ctx.closePath();


    } else if (!cont)
{
var painter = document.getElementById("fore_painter");
var ctx = painter.getContext("2d");
var space_width = 2 * selected_size; // should actually be sqrt(2) * selected_size because the max size is given on 45 degrees
ctx.clearRect(Math.min(start_x, end_x) - space_width, Math.min(start_y, end_y) - space_width, Math.max(start_x, end_x) + space_width, Math.max(start_y, end_y) + space_width);

if (navigator.userAgent.indexOf("Firefox")!=-1)
{
end_x = e.layerX;
end_y = e.layerY;

}
else
{
end_x = e.offsetX;
end_y = e.offsetY;
}

ctx.beginPath();
ctx.lineCap = "round";
ctx.lineWidth = selected_size;
ctx.strokeStyle="#" + selected_color;
ctx.moveTo(start_x, start_y);
ctx.lineTo(end_x, end_y);
ctx.stroke();
ctx.closePath();
}
else
{


/*var painter = document.getElementById("painter");
var ctx = painter.getContext("2d");*/
start_x = end_x;
start_y = end_y;
if (navigator.userAgent.indexOf("Firefox")!=-1)
{
end_x = e.layerX;
end_y = e.layerY;

}
else
{
end_x = e.offsetX;
end_y = e.offsetY;
}
funqueue.push([cur_line, start_x, start_y, end_x, end_y, selected_color, selected_size]);
/*ctx.lineTo(end_x, end_y);
ctx.stroke();
*/
$.ajax({url:"/add/" + cur_line + "/" + start_x + "/" + start_y + "/" + end_x + "/" + end_y + "/" + selected_color + "/" + selected_size});
}
}

function endline()
{
var painter = document.getElementById("painter");
var ctx = painter.getContext("2d");
    var cont = $("#radio_2").attr('checked');
    var rectangle=$("#radio_3").attr('checked');

var painter = document.getElementById("fore_painter");
painter.onmousemove = null;
    if (rectangle) {
funqueue.push([cur_line, start_x, start_y, end_x, start_y, selected_color, selected_size]);
funqueue.push([cur_line, end_x, start_y, end_x, end_y, selected_color, selected_size]);
funqueue.push([cur_line, end_x, end_y, start_x, end_y, selected_color, selected_size]);
funqueue.push([cur_line, start_x, end_y, start_x, start_y, selected_color, selected_size]);

var ctx = painter.getContext("2d");
clear_all(painter, ctx);

    $.ajax({url:"/add/" + cur_line + "/" + start_x + "/" + start_y + "/" + end_x + "/" + start_y + "/" + selected_color + "/" + selected_size});
    $.ajax({url:"/add/" + cur_line + "/" + end_x + "/" + start_y + "/" + end_x + "/" + end_y + "/" + selected_color + "/" + selected_size});
    $.ajax({url:"/add/" + cur_line + "/" + end_x + "/" + end_y + "/" + start_x + "/" + end_y + "/" + selected_color + "/" + selected_size});
    $.ajax({url:"/add/" + cur_line + "/" + start_x + "/" + end_y + "/" + start_x + "/" + start_y + "/" + selected_color + "/" + selected_size});
    } else if (!cont) {
funqueue.push([cur_line, start_x, start_y, end_x, end_y, selected_color, selected_size]);
/*ctx.beginPath();
ctx.lineCap = "round";
ctx.strokeStyle="#" + selected_color;
ctx.moveTo(start_x, start_y);
ctx.lineTo(end_x, end_y);
ctx.stroke();
ctx.closePath();
*/
var ctx = painter.getContext("2d");
clear_all(painter, ctx);

    $.ajax({url:"/add/" + cur_line + "/" + start_x + "/" + start_y + "/" + end_x + "/" + end_y + "/" + selected_color + "/" + selected_size});
}//else ctx.closePath();

    cur_line = undefined;

}


function colorToHex(c) {
var m = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(c);
return m ? (1 << 24 | m[1] << 16 | m[2] << 8 | m[3]).toString(16).substr(1) : c;
}
