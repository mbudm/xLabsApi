// xLabsApi. 
//
// Interface for the xLabs Gaze Tracking Chrome Extension
// Packaged for either AMD, CommonJS or the global object. 
// As per pattern used in EventEmitter v4.2.11 - git.io/ee
//
// Usage: < xLabsApi instance >.setup( onReadyHandler, onUpdateHandler );

;(function () {
  
  'use strict';

  ///////////////////////////////////////////////////////////////////////////////////////////////////
  // Variables
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  var config = null,
      callbackReady = null,
      callbackState = null,
      callbackScope = null;

  ///////////////////////////////////////////////////////////////////////////////////////////////////
  // Core API
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  var getConfig = function( path ) {
    return getObjectProperty( config, path );
  };

  var setConfig = function( path, value ) {
    window.postMessage( { 
      target: "xLabs", 
      config: { 
        path: path, 
        value: value
      } 
    }, "*" );
  };

  ///////////////////////////////////////////////////////////////////////////////////////////////////
  // JSON
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  var getObjectProperty = function( object, path ) {
    if( ( object == undefined ) || ( object == null ) ) {
      return "";
    }
    //console.log( "Uril util"+path );
    var parts = path.split('.'),
        last = parts.pop(),
        l = parts.length,
        i = 1,
        current = parts[ 0 ];

    while( ( object = object[ current ] ) && i < l ) {
      current = parts[ i ];
      //console.log( "Util object: "+JSON.stringify( object ) );
      i++;
    }

    if( object ) {
      //console.log( "Util result: "+object[ last ] );
      return object[ last ];
    }
  };

  ///////////////////////////////////////////////////////////////////////////////////////////////////
  // Truth - data for gaze calibration. Basically you need to tell xLabs where the person is looking
  // at a particular time. 
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  var setTruthEnabled = function( enabled ) {
    var value = "0";
    if( enabled ) {
      value = "1";
    } 
    setConfig( "truth.enabled", value );    
  };

  var setTruthScreen = function( x, y ) {
    setConfig( "truth.x", x );    
    setConfig( "truth.y", y );    
  };

  var calibrate = function( id ) {
    var request = "3p";
    if( id ) {
      request = id;
    }
  
    setConfig( "calibration.request", request );    
    console.log( "Calibrating..." );
  };

  ///////////////////////////////////////////////////////////////////////////////////////////////////
  // Time - in a compatible format.
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  var getTimestamp = function() {
    // unified function to get suitable timestamps
    var dateTime = new Date();
    var timestamp = dateTime.getTime();
    return timestamp;
  };

  ///////////////////////////////////////////////////////////////////////////////////////////////////
  // Resolution
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  var getDpi = function() {
    var dppx = window.devicePixelRatio ||
      (    window.matchMedia 
        && window.matchMedia( "(min-resolution: 2dppx), (-webkit-min-device-pixel-ratio: 1.5),(-moz-min-device-pixel-ratio: 1.5),(min-device-pixel-ratio: 1.5)" ).matches? 2 : 1 )
      || 1;

    var w = ( screen.width  * dppx );
    var h = ( screen.height * dppx );
    return calcDpi( w, h, 13.3, 'd' );
  };

  var calcDpi = function( w, h, d, opt ) {
    // Calculate PPI/DPI
    // Source: http://dpi.lv/
    w>0 || (w=1);
    h>0 || (h=1);
    opt || (opt='d');
    var dpi = (opt=='d' ? Math.sqrt(w*w + h*h) : opt=='w' ? w : h) / d;
    return dpi>0 ? Math.round(dpi) : 0;
  };

  ///////////////////////////////////////////////////////////////////////////////////////////////////
  // Coordinate conversion
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  var documentOffset = function() {
    if( !documentOffsetReady() ) {
      throw "Should not call scr2doc() unless mouse moved, i.e. browser.document.offset.ready == 1";
    }
    var x = parseInt( getConfig( "browser.document.offset.x" ) );
    var y = parseInt( getConfig( "browser.document.offset.y" ) );
    return { x: x, y: y };
  };

  var documentOffsetReady = function() {
    var ready = getConfig( "browser.document.offset.ready" );
    if( ready.localeCompare( "1" ) != 0 ) {
      return false;
    }
    return true;
  };

  var scr2docX = function( screenX ) {
    if( !documentOffsetReady() ) {
      throw "Should not call scr2doc() unless mouse moved, i.e. browser.document.offset.ready == 1";
    }

    var xOffset = getConfig( "browser.document.offset.x" );
    return screenX - window.screenX - xOffset;
  };

  var scr2docY = function( screenY ) {
    if( !documentOffsetReady() ) {
      throw "Should not call scr2doc() unless mouse moved, i.e. browser.document.offset.ready == 1";
    }

    var yOffset = getConfig( "browser.document.offset.y" );
    return screenY - window.screenY - yOffset;
  };

  var scr2doc = function( screenX, screenY ) {
    return {
      x: scr2docX( screenX ),
      y: scr2docY( screenY )
    }
  };

  var doc2scrX = function( documentX ) {
    if( !documentOffsetReady() ) {
      throw "Should not call scr2doc() unless mouse moved, i.e. browser.document.offset.ready == 1";
    }
    var xOffset = getConfig( "browser.document.offset.x" );
    return documentX + window.screenX + xOffset;
  };

  var doc2scrY = function( documentY ) {
    if( !documentOffsetReady() ) {
      throw "Should not call scr2doc() unless mouse moved, i.e. browser.document.offset.ready == 1";
    }
    var yOffset = getConfig( "browser.document.offset.y" );
    return documentY + window.screenY + yOffset;
  };

  var doc2scr = function( documentX, documentY ) {
    return {
      x: doc2scrX( documentX ),
      y: doc2scrY( documentY )
    }
  };

  ///////////////////////////////////////////////////////////////////////////////////////////////////
  // Setup
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  var onApiState = function( cfg ) {
    config = cfg;
    if( callbackState != null ) {
      callbackState.call(callbackScope,config);
    }
  };

  var onApiReady = function() {
    console.log( "xLabs API is ready." );
    if(callbackReady != null ) {
      callbackReady.call(callbackScope);
    }
  };

  var setup = function(scope, cbReady, cbState) {
    callbackReady = cbReady;
    callbackState = cbState;
	  callbackScope = scope;

    // add event listeners
    document.addEventListener( "xLabsApiReady", function() {
      onApiReady();
    } );

    document.addEventListener( "xLabsApiState", function( event ) {
      onApiState( event.detail );
    } );
  };
  
  /* only return public methods */
  var xLabsApi = {
    setup:setup,
    getConfig:getConfig,
    setConfig:setConfig,
    getDocumentOffset:documentOffset, //better name for getter
    setTruthEnabled:setTruthEnabled,
    setTruthScreen:setTruthScreen
  };
  
  // Expose the class either via AMD, CommonJS or the global object
  if (typeof define === 'function' && define.amd) {
      define(function () {
          return xLabsApi;
      });
  }
  else if (typeof module === 'object' && module.exports){
      module.exports = xLabsApi;
  }
  else {
      this.xLabsApi = xLabsApi;
  }
}.call(this));

