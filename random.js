
var makeUid;

(function(){

var random;

if(typeof(exports) !== 'undefined'){
	require('./seedrandom/seedrandom');
}else{
}
random = function(){return Math.floor(Math.random()*2147483648);}

var base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=";

var alphaNumericChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";


function randomBase64(manyChars){

	var indexes = [];
	for(var i=0;i<manyChars;i+=5){
		var r = random();

		indexes = indexes.concat([
			r & 0x3F,
			(r >> 6)  & 0x3F,
			(r >> 12) & 0x3F,
			(r >> 18) & 0x3F,
			(r >> 24) & 0x3F,
		]);
	}

	var result = '';
	for(var i=0;i<manyChars;++i){
		result += base64Chars.charAt(indexes[i]);
	}
	return result;
}


makeUid = function(){
	//22 characters make up the UID (132 bits, we want 128 but with base 64 that as close as we can get.)
	//these are derived from encoding 4 random 32 bit ints
	
	var uid = '';
	var left=0;
	
	
	var r1 = random();
	var r2 = random();
	var r3 = random();
	var r4 = random();
	
	var p = [
			r1		   & 0x3F,
			(r1 >> 6)  & 0x3F,
			(r1 >> 12) & 0x3F,
			(r1 >> 18) & 0x3F,
			(r1 >> 24) & 0x3F,
			(r2 & 0x0F)|((r1 >> 30) & 0x03),
			(r2 >> 4)  & 0x3F,
			(r2 >> 10)  & 0x3F,
			(r2 >> 16)  & 0x3F,
			(r2 >> 22)  & 0x3F,
			(r3 & 0x03)|((r2 >> 28)  & 0x3F),
			(r3 >> 2) & 0x3F,
			(r3 >> 8) & 0x3F,
			(r3 >> 14) & 0x3F,
			(r3 >> 20) & 0x3F,
			(r3 >> 26) & 0x3F,
			r4 		   & 0x3F,
			(r4 >> 6) & 0x3F,
			(r4 >> 12) & 0x3F,
			(r4 >> 18) & 0x3F,
			(r4 >> 24) & 0x3F,
			(r4 >> 30) & 0x3F
			];
	
	for(var i=0;i<22;++i){
		uid += base64Chars[p[i]];
	}
	return uid;
}

function randomAlpha(many, chars){
	chars = chars || alphaNumericChars;
	var result = '';
	for(var i=0;i<many;++i){
		result += chars[random() % chars.length];
	}
	return result;
}

if(typeof(exports) !== 'undefined'){
	exports.make = makeUid;

	exports.uid = makeUid;
	exports.alpha = randomAlpha;
	exports.base64 = randomBase64;
}

})();


