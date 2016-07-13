$(document).ready(function(){

  console.log("[haar classification trainer 0.1]");

  //globals
  var trainerOffset =     $("#trainer-wrapper").offset(); //absolute wrapper (offset)window
  var done = false;       // trainer status

  var dir = "set/";       // images directory
  var imgs = [];          // images array
  var currentImg = 0;     // currently displayed image pointer

  var tracker = [];       // tracker array
  var trackerSize = 30;   // tracker init size

  var scrollDelta = 4;    // scrolling sensivity
  var scrollSteps = 3;    // scrolling steps



  //load all images from directory
  $.ajax({
      url : dir,
      success: function (data) {
          $(data).find("a").attr("href", function (i, val) {
              if( val.match(/\.(jpe?g|png|gif)$/) ) {
                imgs.push(val); //push found img item to imgs array
              }
          });

          //init first img in wrapper
          $('#trainer-wrapper').css("background-image", "url(" + dir + imgs[0] +")");

          //define canvas size by first image
          canvas = new Image();
          canvas.src = dir + imgs[0];
          canvas.onload = function(){
            console.log("[1] define canvas dimensions");
            $('#trainer-wrapper').width(canvas.width);
            $('#trainer-wrapper').height(canvas.height);
          }

          //LOG image count
          $("#dd-image").text(currentImg + 1 + " / " + imgs.length);
          console.log("[i] load next image("+ (currentImg + 1) +"/"+imgs.length+")");
      }
  });




  // (CLICK) add tracker
  $('#trainer-wrapper').click(function(){
    if(!done){

      //add new tracker to tracker array
      tracker.push([posX, posY, trackerSize]);

      //create new tracker DOM
      $(this).append("<div class='tracker tracked' id='tracker-"+ tracker.length +"'></div>");
      $("#tracker-"+tracker.length).css({
        left:  posX,
        top: posY,
        width: trackerSize,
        height: trackerSize
      });

      //LOG tracker count
      $("#dd-tracked").text(tracker.length);
      console.log("[+] add tracker(x"+posX+",y"+posY+",s"+trackerSize+")");
    }
  });




  // (SPACEBAR) next image
  $('body').keyup(function(e){
     if(e.keyCode == 32){

      //add tracker data to data-list
      //format: str(file.ext) int(trackerCount) for t in trackers { int(t(posx)) int(t(posy)) int(t(sizex)) int(t(sizey)) }
      trackerString = imgs[currentImg] + " " + tracker.length;
      tracker.forEach(function(t) { trackerString += " " + t[0] + " " + t[1] + " " + t[2] + " " + t[2]; });
      trackerString += "\n";
      $("#data-list").append(trackerString);

      //reset LOG, tracker
      $("#dd-tracked").text(0);
      $(".tracked").remove();
      tracker = [];

      //load next img or done
      if(currentImg < imgs.length - 1){
        currentImg++;
        $('#trainer-wrapper').css("background-image", "url(" + dir + imgs[currentImg] +")");

        //LOG images counter
        $("#dd-image").text(currentImg + 1 + " / "+imgs.length);
        console.log("[i] load next image("+ (currentImg + 1) +"/"+imgs.length+")");
      }
      else{
        done = true;
        //LOG done
        console.log("[d] all done, go to sleep.");
      }
    }
  });




  // (SCROLL) in/decrease tracker size
  $(window).bind('mousewheel', function(event) {

    //block browser scrolling
    event.preventDefault();

    //scroll up - increase tracker size
    if (event.originalEvent.wheelDelta >= scrollDelta) {
        if(trackerSize > 25){
          trackerSize = trackerSize - scrollSteps;
        }
    }
    //scroll down - decrease tracker size
    else if(event.originalEvent.wheelDelta <= -scrollDelta) {
      if(trackerSize < 500){
        trackerSize = trackerSize + scrollSteps;
      }
    }

    //apply tracker size
    if($("#active-tracker").height != trackerSize ){

      //update active tracker (css)
      $("#active-tracker").height(trackerSize).width(trackerSize);
      $("#active-tracker").css("margin", "-" + Math.ceil(trackerSize/2) + "px");

      //LOG tracker size
      $("#dd-size").text(Math.ceil(trackerSize));
    }
  });




  // (MOUSE MOVEMENT) update tracker position, error display (css)
  $("#trainer-wrapper").on('mousemove', function(e){

    //attach active tracker to mouse position (css)
    $('#active-tracker').css({
       left:  e.pageX - Math.round(trainerOffset.left),
       top:   e.pageY - Math.round(trainerOffset.top)
    });

    //eval absolute position x,y (for data list)
    posY = e.pageY - Math.round(trainerOffset.top) - Math.ceil(trackerSize/2);
    posX = e.pageX - Math.round(trainerOffset.left) - Math.ceil(trackerSize/2);

    //error display (css)
    if(posX < 0 || posY < 0 || (posX + trackerSize) > canvas.width|| (posY + trackerSize) > canvas.height ){
      $('#active-tracker').addClass("error");
    }
    else{
      $('#active-tracker').removeClass("error");
    }

    //LOG posX, posY
    $("#dd-posx").text(posX);
    $("#dd-posy").text(posY);
  });
});
