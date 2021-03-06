
function clean () {
  $.ajax({url:"/clean"});
}

function undo () {
  $.ajax({url:"/undo"});
}

function redo () {
  $.ajax({url:"/redo"});
}

var deltime = 100;
var draw_deltime = 30;
var brushtime = 15;

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
    context.lineTo(tox, toy);
    context.moveTo((tox - headlen * Math.cos(angle - Math.PI / 6)) | 0, (toy - headlen * Math.sin(angle - Math.PI / 6))|0);
  context.lineTo(tox, toy);
    context.moveTo((tox - headlen * Math.cos(angle + Math.PI / 6)) | 0, (toy - headlen * Math.sin(angle + Math.PI / 6))|0);
  context.lineTo(tox, toy);
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
window.setTimeout(read_lines, deltime);
}

function clear_all(painter, ctx)
{
ctx.clearRect(0, 0, painter.width, painter.height);

}

var opened = false;

var old_spec;
function draw_line(l, painter, ctx)
{

    if (l[1] == "text" || l[1] == "block") {
        if (old_spec) {
            ctx.stroke();
            ctx.closePath();
            old_spec = undefined;
        }
        if (l[1] == "block") {
            ctx.fillStyle="#" + l[2];
            ctx.fillRect(parseInt(l[3]), parseInt(l[4]), parseInt(l[5])-parseInt(l[3]), parseInt(l[6])-parseInt(l[4]));
        } else if (l[1] == "text") {
            var font_size = l[3];
            ctx.font = font_size + "px Lucida Sans Unicode"; // selected_size
            ctx.fillStyle = "#" + l[2];
            ctx.fillText(atob(l[6]), parseInt(l[4]), parseInt(l[5])+parseInt(font_size));
        }
    } else if (l[1] == "path") {
        var cur_spec = [l[0], l[2], l[3], parseInt(l[4]), parseInt(l[5])];
        if (!old_spec || cur_spec.toString() != old_spec.toString()) {
            if (old_spec) {
                ctx.stroke();
                ctx.closePath();
            }
            ctx.beginPath();
            ctx.lineCap = "round";
            ctx.lineWidth = l[3];
            ctx.strokeStyle="#" + l[2];
            ctx.moveTo(parseInt(l[4]), parseInt(l[5]));
        }
        for (i = 6; i < l.length; i += 2) {
            ctx.lineTo(parseInt(l[i]), parseInt(l[i+1]));
        }
        old_spec = [l[0], l[2], l[3], parseInt(l[i]), parseInt(l[i+1])]
    }
}

var doubleBuffer = false;
var tempCanvas;
if (doubleBuffer) {
    tempCanvas = document.createElement('canvas');
    $(document).ready(function() {
        tempCanvas.width = screen.width;
        tempCanvas.height = screen.height;
        tempCanvas.style = "position: absolute; left: 0; top: 0; background-color: transparent;z-index:-100; display: none;";
        document.body.appendChild(tempCanvas);
    });
}
function draw_all_lines()
{
    var painter = document.getElementById("painter");
    var ctx = painter.getContext("2d");
    var tempCtx;
    if (doubleBuffer) {
        tempCtx = tempCanvas.getContext('2d');
        clear_all(tempCanvas, tempCtx);
    } else {
        tempCtx = ctx;
    }
    var cleared = false;

    old_spec = undefined;
    while (funqueue.length > 0) {
        d = funqueue.shift();
        if (d == null) {
            if (old_spec) {
                tempCtx.stroke();
                tempCtx.closePath();
                old_spec = undefined;
            }
            clear_all(painter, tempCtx);
            cleared = true;
        }
        else draw_line(d, painter, tempCtx);
    }
    if (old_spec) {
        tempCtx.stroke();
        tempCtx.closePath();
        old_spec = undefined;
    }

    if (doubleBuffer) {
        if (cleared) ctx.putImageData(tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height), 0, 0);
        else ctx.drawImage(tempCanvas, 0, 0);
    }


    window.requestAnimationFrame(draw_all_lines);
}
window.requestAnimationFrame(draw_all_lines);



function read_lines() {
  $.ajax({url:"/" + (last_index + lines_painted)}).done(done_read_lines);


}

var start_x = 0;
var start_y = 0;
// var painter = document.getElementById("painter");
var cur_line = null;
var brush_vectors;
var brush_timer;
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
        var isbrush = $("#radio_2").attr('checked');
    if (istext) {
        inp = window.prompt("");
        if (inp) {

            funqueue.push([cur_line, "text", selected_color, "20", start_x, start_y, btoa(inp), ]);
            add_line("text" + "/" + selected_color + "/" + "20" + "/" + start_x + "/" + start_y + "/" + btoa(inp));
            new_shape();

        }
        cur_line = undefined;

        return;
    }
    else if (isbrush) {
        brush_vectors = [[start_x, start_y]];
        prev_last_sent = undefined;
        brush_timer = setTimeout(paint_brush, brushtime);
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
    var block=$("#radio_6").attr('checked');
    if (block) {

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

ctx.fillStyle="#" + selected_color;
ctx.fillRect(start_x, start_y, end_x-start_x, end_y-start_y);


    } else if (arrow) {
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
    funqueue.push([cur_line, "path", selected_color, selected_size, start_x, start_y, end_x, end_y]);
    brush_vectors.push([end_x, end_y]);
}
}

var prev_last_sent;
function paint_brush(set_timer=true) {
    if (brush_vectors.length > 0) {
        to_send = "path" + "/" + selected_color + "/" + selected_size;
        var prev_len = brush_vectors.length;
        var added = brush_vectors.length > 1;
        while (brush_vectors.length > 1) {
            d = brush_vectors.shift();
            to_send = to_send + "/" + d[0] + "/" + d[1]
        }
        d = brush_vectors[0];
        if (typeof prev_last_sent === "undefined" || prev_last_sent.toString() != d.toString() || prev_len != 1) {
            prev_last_sent = d;
            to_send = to_send + "/" + d[0] + "/" + d[1];
            added = true;
        }

        if (added) {
            add_line(to_send);
        }
    }
    if (set_timer) {
        brush_timer = setTimeout(paint_brush, brushtime);
    }
}

function endline()
{
    var line = $("#radio_1").attr('checked');
    var cont = $("#radio_2").attr('checked');
    var rectangle=$("#radio_3").attr('checked');
    var arrow=$("#radio_4").attr('checked');
    var block=$("#radio_6").attr('checked');
    var isbrush = $("#radio_2").attr('checked');

var painter = document.getElementById("fore_painter");
    painter.onmousemove = null;
    var ctx = painter.getContext("2d");
    clear_all(painter, ctx);

    if (isbrush) {
        clearTimeout(brush_timer);
        prev_last_sent = undefined;
        brush_timer = undefined;
        paint_brush(false);

    } else if (block) {
        funqueue.push([cur_line, "block", selected_color, start_x, start_y, end_x, end_y, ]);
        add_line("block" + "/" + selected_color + "/" + start_x + "/" + start_y + "/" + end_x + "/" +  end_y);
    } else if (arrow) {
        var headlen = 3*Math.max(selected_size, arrow_min_size); // length of head in pixels
  var dx = end_x - start_x;
  var dy = end_y - start_y;
  var angle = Math.atan2(dy, dx);
        funqueue.push([cur_line, "path", selected_color, selected_size,
                       start_x, start_y, end_x, end_y]);
        funqueue.push([cur_line, "path", selected_color, selected_size,
                       (end_x - headlen * Math.cos(angle - Math.PI / 6))|0, (end_y - headlen * Math.sin(angle - Math.PI / 6))|0, end_x, end_y]);
        funqueue.push([cur_line, "path", selected_color, selected_size,
                       (end_x - headlen * Math.cos(angle + Math.PI / 6))|0, (end_y - headlen * Math.sin(angle + Math.PI / 6))|0, end_x, end_y]);

        add_line("path" + "/" + selected_color + "/" + selected_size + "/" +
                 start_x + "/" + start_y + "/" + end_x + "/" + end_y + "/");
        add_line("path" + "/" + selected_color + "/" + selected_size + "/" +
                 ((end_x - headlen * Math.cos(angle - Math.PI / 6))|0) + "/" +  ((end_y - headlen * Math.sin(angle - Math.PI / 6))|0) + "/" +
                 end_x + "/" + end_y);
        add_line("path" + "/" + selected_color + "/" + selected_size + "/" +
                 ((end_x - headlen * Math.cos(angle + Math.PI / 6))|0) + "/" +  ((end_y - headlen * Math.sin(angle + Math.PI / 6))|0) + "/" +
                 end_x + "/" + end_y);

    } else if (rectangle) {
        funqueue.push([cur_line, "path", selected_color, selected_size,
                       start_x, start_y,
                       end_x, start_y,
                       end_x, end_y,
                       start_x, end_y,
                       start_x, start_y, ]);

        add_line("path" + "/" + selected_color + "/" + selected_size + "/" +
                 start_x + "/" + start_y + "/" +
                 end_x + "/" + start_y + "/" +
                 end_x + "/" + end_y + "/" +
                 start_x + "/" + end_y + "/" +
                 start_x + "/" + start_y + "/");
    } else if (line) {
funqueue.push([cur_line, "path", selected_color, selected_size, start_x, start_y, end_x, end_y]);
/*ctx.beginPath();
ctx.lineCap = "round";
ctx.strokeStyle="#" + selected_color;
ctx.moveTo(start_x, start_y);
ctx.lineTo(end_x, end_y);
ctx.stroke();
ctx.closePath();
*/
    add_line("path" + "/" + selected_color + "/" + selected_size + "/" + start_x + "/" + start_y + "/" + end_x + "/" + end_y);
}//else ctx.closePath();
            new_shape();

    cur_line = undefined;
}


function colorToHex(c) {
var m = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(c);
return m ? (1 << 24 | m[1] << 16 | m[2] << 8 | m[3]).toString(16).substr(1) : c;
}
