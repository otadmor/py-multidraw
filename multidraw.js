
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
arrow_min_size = 4
function canvas_arrow(context, fromx, fromy, tox, toy, size) {
    var headlen = 3*Math.max(arrow_min_size, size); // length of head in pixels
  var dx = tox - fromx;
  var dy = toy - fromy;
  var angle = Math.atan2(dy, dx);
  context.moveTo(fromx, fromy);
    context.lineTo(tox+(size>1), toy+(size>1));
  context.moveTo(tox, toy);
    context.lineTo((tox - headlen * Math.cos(angle - Math.PI / 6)) | 0, (toy - headlen * Math.sin(angle - Math.PI / 6))|0);
  context.moveTo(tox, toy);
    context.lineTo((tox - headlen * Math.cos(angle + Math.PI / 6)) | 0, (toy - headlen * Math.sin(angle + Math.PI / 6))|0);
}

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
    if (l[3] != "text" && old_spec && cur_spec.toString() == old_spec.toString()) {
        ctx.lineTo(parseInt(l[3]), parseInt(l[4]));
    } else {
        if (old_spec || l[3] == "text") {
            ctx.stroke();
            ctx.closePath();
        }
        if (l[3] == "text") {
            ctx.font = "20px Lucida Sans Unicode"; // selected_size
            ctx.fillStyle = "#" + l[5];
            ctx.fillText(atob(l[4]), parseInt(l[1]), parseInt(l[2])+20);

        } else {
        ctx.beginPath();
        ctx.lineCap = "round";
        ctx.lineWidth = l[6];
        ctx.strokeStyle="#" + l[5];
        ctx.moveTo(parseInt(l[1]), parseInt(l[2]));
            ctx.lineTo(parseInt(l[3]), parseInt(l[4]));
        }
    }
    if (l[3] == "text") {
        old_spec = undefined;
    } else {
        old_spec = [parseInt(l[3]), parseInt(l[4]), l[5], l[6], l[0]]
    }
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
        var istext = $("#radio_5").attr('checked');
    if (istext) {
        inp = window.prompt("");
        if (inp) {

            funqueue.push([cur_line, start_x, start_y, "text", btoa(inp), selected_color, selected_size]);
            add_line(start_x + "/" + start_y + "/" + "text" + "/" + btoa(inp) + "/" + selected_color + "/" + selected_size);
            new_shape();

        }
        cur_line = undefined;

        return;
    }
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


    var line = $("#radio_1").attr('checked');
    var cont = $("#radio_2").attr('checked');
    var rectangle=$("#radio_3").attr('checked');
    var arrow=$("#radio_4").attr('checked');
    if (arrow) {
var painter = document.getElementById("fore_painter");
var ctx = painter.getContext("2d");
var space_width = 20 * selected_size; // should actually be sqrt(2) * selected_size because the max size is given on 45 degrees
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

        canvas_arrow(ctx, start_x, start_y, end_x, end_y, selected_size);
ctx.stroke();
ctx.closePath();
    // context.fill();

    } else if (rectangle) {

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


    } else if (line)
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
    add_line(start_x + "/" + start_y + "/" + end_x + "/" + end_y + "/" + selected_color + "/" + selected_size);

}
}

function endline()
{
var painter = document.getElementById("painter");
var ctx = painter.getContext("2d");
    var line = $("#radio_1").attr('checked');
    var cont = $("#radio_2").attr('checked');
    var rectangle=$("#radio_3").attr('checked');
    var arrow=$("#radio_4").attr('checked');

var painter = document.getElementById("fore_painter");
    painter.onmousemove = null;
    var ctx = painter.getContext("2d");
    clear_all(painter, ctx);

    if (arrow) {
        var headlen = 3*Math.max(selected_size, arrow_min_size); // length of head in pixels
  var dx = end_x - start_x;
  var dy = end_y - start_y;
  var angle = Math.atan2(dy, dx);
        funqueue.push([cur_line, start_x, start_y, end_x+(selected_size>1), end_y+(selected_size>1), selected_color, selected_size]);
        funqueue.push([cur_line, end_x, end_y, (end_x - headlen * Math.cos(angle - Math.PI / 6))|0, (end_y - headlen * Math.sin(angle - Math.PI / 6))|0, selected_color, selected_size]);
        funqueue.push([cur_line, end_x, end_y, (end_x - headlen * Math.cos(angle + Math.PI / 6))|0, (end_y - headlen * Math.sin(angle + Math.PI / 6))|0, selected_color, selected_size]);

        add_line(start_x + "/" + start_y + "/" + (end_x+(selected_size>1)) + "/" + (end_y+(selected_size>1)) + "/" + selected_color + "/" + selected_size);
        add_line(end_x + "/" + end_y + "/" + ((end_x - headlen * Math.cos(angle - Math.PI / 6))|0) + "/" +  ((end_y - headlen * Math.sin(angle - Math.PI / 6))|0) + "/" + selected_color + "/" + selected_size);
        add_line(end_x + "/" + end_y + "/" + ((end_x - headlen * Math.cos(angle + Math.PI / 6))|0) + "/" +  ((end_y - headlen * Math.sin(angle + Math.PI / 6))|0) + "/" + selected_color + "/" + selected_size);


    } else if (rectangle) {
funqueue.push([cur_line, start_x, start_y, end_x, start_y, selected_color, selected_size]);
funqueue.push([cur_line, end_x, start_y, end_x, end_y, selected_color, selected_size]);
funqueue.push([cur_line, end_x, end_y, start_x, end_y, selected_color, selected_size]);
funqueue.push([cur_line, start_x, end_y, start_x, start_y, selected_color, selected_size]);

    add_line(start_x + "/" + start_y + "/" + end_x + "/" + start_y + "/" + selected_color + "/" + selected_size);
    add_line(end_x + "/" + start_y + "/" + end_x + "/" + end_y + "/" + selected_color + "/" + selected_size);
    add_line(end_x + "/" + end_y + "/" + start_x + "/" + end_y + "/" + selected_color + "/" + selected_size);
    add_line(start_x + "/" + end_y + "/" + start_x + "/" + start_y + "/" + selected_color + "/" + selected_size);
    } else if (line) {
funqueue.push([cur_line, start_x, start_y, end_x, end_y, selected_color, selected_size]);
/*ctx.beginPath();
ctx.lineCap = "round";
ctx.strokeStyle="#" + selected_color;
ctx.moveTo(start_x, start_y);
ctx.lineTo(end_x, end_y);
ctx.stroke();
ctx.closePath();
*/
    add_line(start_x + "/" + start_y + "/" + end_x + "/" + end_y + "/" + selected_color + "/" + selected_size);
}//else ctx.closePath();
            new_shape();

    cur_line = undefined;

}


function colorToHex(c) {
var m = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(c);
return m ? (1 << 24 | m[1] << 16 | m[2] << 8 | m[3]).toString(16).substr(1) : c;
}
