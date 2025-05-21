// Block 2: Event Handlers & Utilities
var i = 0; // Consider namespacing or scoping this better if it's used by multiple functions.

function time_range(beginTime, endTime, varTime) {
    var strb = beginTime.split(":");
    if(strb.length != 2) {
        return false;
    }
    var stre = endTime.split(":");
    if(stre.length != 2) {
        return false;
    }
    var strv = varTime.split(":");
    if(strv.length != 2) {
        return false;
    }
    var b = new Date();
    var e = new Date();
    var v = new Date();
    b.setHours(strb[0]);
    b.setMinutes(strb[1]);
    e.setHours(stre[0]);
    e.setMinutes(stre[1]);
    v.setHours(strv[0]);
    v.setMinutes(strv[1]);

    if((v.getTime() - b.getTime() >= 0 && (e.getTime() - v.getTime()) > 0)) {
        return true;
    } else {
        return false;
    }
}

function addSong() {
    $("#addsong").click();
}

function songlist(file) {
    // Original content was commented out, keeping it that way.
    //			 var file = document.getElementById('file');
    //	        
    //	        var fileList = file.files;

    //	        for(var i = 0; i < fileList.length; i++) {
    //				var filePath = file.files[i];
    //		        var reader = new FileReader();
    //		        reader.readAsDataURL(filePath);
    //		        reader.onload = function (e) {
    //		        	$(".img-cont").append("<div class='imgbox'>"+"<img src="+this.result+">"+"<div class='del' onclick='del(this);' ></div></div>");					
    //				}
    //	        }
    //	        
    //	       }
}

// Event Handlers from Block 2
$("#fish").mouseover(function() {
    $("#mixcg").append("<object class='animated slideInLeft'>MixCG</object>");
    $("#hclady").append("<object class='animated slideInRight'>HC</object>");
});

$("#fish ").mouseout(function() {
    $("#mixcg").empty();
    $("#hclady").empty();
    $('#lady').addClass('animated fadeOutLeftBig');
    setTimeout(function(){
        $("#lady").css("display", "none");
        $('#lady').removeClass('fadeOutLeftBig');   
    }, 1000);
});

$("#fish").dblclick(function() {
    $('#lady').addClass('animated fadeInUp');
    setTimeout(function(){
        $("#lady").css("display", "block");
       // $('#lady').removeClass('fadeInUp');
    }, 1000);
});

$("#sun").mouseover(function() {
    i=Math.ceil(Math.random()*18); // 'i' is from the global scope above
    $("#title").css("display", "block");
    $("body").removeClass();
    $("body").addClass('b_background' + i);
    $("#bgm")[0].src = "";
    $("#bgm")[0].src = "css/bgm" + i + ".mp3";
    $("#bgm")[0].play();

    if(i > 18) {
        i = 0;
    } else {
        i = Math.ceil(Math.random()*17);
    }
});

$("#sun").mouseout(function() {
    $("#title").css("display", "none");
    if(1 == 1) { // This condition is always true
        $("#tips").css("display", "none");
    }
});


// Block 3: window.onload and changeStar
function changeStar(){ // Defined globally or scoped appropriately if only used by window.onload
    console.log(111); // This was present in the original script
    var datetime = new Date();
    var reson = (datetime.getHours() + ":" + datetime.getMinutes());
    console.log(reson); // This was present in the original script
    if(time_range("18:00", "24:00", reson)||time_range("24:00", "06:00", reson)) {
        $("#sun").css("background-image","url(images/moon.png)");
    }
}

window.onload = function() {
    var index=Math.ceil(Math.random()*17);
    $("body").removeClass();
    $("body").addClass('b_background' + index);
    $("#bgm")[0].src = "";
    $("#bgm")[0].src = "music/bgm" + index + ".mp3"; // Path might need adjustment if music files are moved
    $("#bgm")[0].play();
    
    // Ensure .dg elements are handled correctly. If dat.gui.js is removed, this might not be necessary
    // or might target other elements if .dg is a generic class.
    if ($(".dg").length > 0) {
        $(".dg").css("opacity", "0");
        $(".dg").css("display","none");
        var dgdiv=document.getElementsByClassName("dg");
        if (dgdiv.length > 0) {
             dgdiv[0].remove();
        }
    }
    
    changeStar();
    setInterval(changeStar, 600000); // Call function reference, not string
};

// Block 4: jQuery Star Generation
$(document).ready(function () {
    var stars = 800;
    var $stars = $('.stars'); // Assuming a div with class="stars" exists for this
    var r = 800;
    for (var j = 0; j < stars; j++) { // Changed loop variable from i to j to avoid conflict with global i
        if (window.CP && window.CP.shouldStopExecution && window.CP.shouldStopExecution(1)){
            break;
        }
        var $star = $('<div/>').addClass('star');
        $stars.append($star);
    }
    if (window.CP && window.CP.exitedLoop) {
        window.CP.exitedLoop(1);
    }
    $('.star').each(function () {
        var cur = $(this);
        var s = 0.2 + Math.random() * 1;
        var curR = r + Math.random() * 300;
        cur.css({
            transformOrigin: '0 0 ' + curR + 'px',
            transform: ' translate3d(0,0,-' + curR + 'px) rotateY(' + Math.random() * 360 + 'deg) rotateX(' + Math.random() * -50 + 'deg) scale(' + s + ',' + s + ')'
        });
    });
});
