(function () {
    /*global mocha,chai,sinon,xLabsApi*/
    'use strict';

    // Setup Mocha and Chai.
    mocha.setup('tdd');
    var assert = chai.assert;

    function flattenCheck(check) {
        var sorted = check.slice(0);
        sorted.sort(function (a, b) {
            return a < b ? -1 : 1;
        });
        return sorted.join();
    }

    // Configure the tests
    suite('xLabsApi', function() {
        var api,
						readyCallback = function(){},
						updateCallback = function(data){};

        setup(function() {
            api = xLabsApi;
        });

        test('initialises the api object', function() {
            assert.isDefined(api);
        });
				
		    test('setup on ready', function(done){
					var readySpy = sinon.spy(readyCallback);
					
					api.setup(this, readyCallback, updateCallback);
					
					assert.isTrue(readySpy.called);
					setTimeout(done, 300);
				});
				test('setup update', function(){
					var updateSpy = sinon.spy(updateCallback);
					assert.isTrue(updateSpy.called);
				});
    		test('mode is off', function(){
					var mode = api.getConfig('system.mode');
					assert.strictEqual(mode,'off');
				});
				test('tracking is suspended', function(){
					var trackingSuspended = api.getConfig('state.trackingSuspended');
						assert.strictEqual(trackingSuspended,'0');
				});
   		 	test('set mode to training', function(){
					api.setConfig( "system.mode", "training" );
					var mode = api.getConfig('system.mode');
					assert.strictEqual(mode,'training');
				});
    		test('get head values', function(){
					var head = api.getConfig('state.head');
					assert.isObject(head,'head is object');
					assert.isNumber(head.x,'head x is number');
					assert.isNumber(head.y,'head y is number');
					assert.isNumber(head.roll,'head roll is number');
					assert.isNumber(head.pitch,'head pitch is number');
					assert.isNumber(head.yaw,'head yaw is number');
				});
    		test('truth', function(){
					var truthEnabled = api.getConfig('truth.enabled');
					assert.strictEqual(truthEnabled,'0');
					api.setTruthEnabled( true );
					api.setTruthScreen( 50, 50 );
					api.calibrate();
					var truthData = api.getConfig('truth');
					assert.isObject(truthData,'truthData is object');
					assert.strictEqual(truth.enabled,'1');
					assert.strictEqual(truth.x,50);
					assert.strictEqual(truth.y,50);
					api.setTruthEnabled( false );
					truthEnabled = api.getConfig('truth.enabled');
					assert.strictEqual(truthEnabled,'0');
				});
    		test('get gaze values', function(){
					var gazeEstimate = api.getConfig('state.gaze.estimate');
					assert.isObject(gazeEstimate,'gaze.estimate is object');
					assert.isNumber(gazeEstimate.x,'gaze.estimate  x is number');
					assert.isNumber(gazeEstimate.y,'gaze.estimate  y is number');
				});
		});
    // Execute the tests.
    mocha.run();
}.call(this));