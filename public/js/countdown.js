
var countdown = function( selector ){
  //console.log("Setting interval.");
  setInterval( function(){
    //console.log("Running for all: "+selector);
    $( selector ).each(function( item ){
      //console.log("Detected one.");
      var datetime = new Date( 10 * 60 * 1000 ) - new Date( new Date() - new Date(  $(this).attr("data-time") ) );
      var inner_html = datetime.getUTCMinutes() + ":" + datetime.getUTCSeconds();
      
      $(this).html(inner_html);
    });
  }, 1000 );

}
