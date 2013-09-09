
exports.module = module

var random;
var randomByte;

require('./../seedrandom/seedrandom');

random = function(){return Math.floor(Math.random()*2147483648);}

randomByte = function(){return Math.floor(Math.random()*256);}

var base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=";

var charToByte = {}
for(var i=0;i<base64Chars.length;++i){
	charToByte[base64Chars[i]] = i
}

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

function makeUidBuffer(){
	if(!global.Buffer){
		throw new Error('cannot make buffer UUID in browser')
	}
	
	var buf = new Buffer(16)
	for(var i=0;i<16;++i){
		buf[i] = randomByte()
	}
	buf.toString = function(){
		//throw new Error('should not auto-convert uuid buffer to string')
		var str = convertBufferUuidToBase64(buf)
		//console.log('converted uuid: ' + str)
		return str
	}
	return buf	
}

function makeUidByteArray(){
	var buf = []
	for(var i=0;i<16;++i){
		buf[i] = randomByte()
	}
	return buf	
}

function convertBase64UuidToBuffer(uuidStr){
	if(!global.Buffer){
		throw new Error('cannot make buffer UUID in browser')
	}
	
	var buf = new Buffer(16)
	var bi = 0
	for(var i=0;i<uuidStr.length;i+=4){
	
		if(i === 20){//only 2 more chars
			var n1 = charToByte[uuidStr[i]]
			var n2 = charToByte[uuidStr[i+1]]
			buf[bi] = n1//take 6 bits
			buf[bi] += (n2 & 0x03) << 6//take 2 bits
		}else{
	
			var n1 = charToByte[uuidStr[i]]
			var n2 = charToByte[uuidStr[i+1]]
			var n3 = charToByte[uuidStr[i+2]]
			var n4 = charToByte[uuidStr[i+3]]
		
			//console.log(n1 + ' ' + n2 + ' ' + n3 + ' ' + n4)
		
			buf[bi] = n1//take 6 bits
			buf[bi] += (n2 & 0x03) << 6//take 2 bits
			++bi
			buf[bi] = (n2 >> 2) & 0x0F//take 4 bits
			//console.log('intermediate1: ' + buf[bi] + ' (' + ((n2 & 0x03)/* >> 6*/) + ')')
			buf[bi] += (n3 & 0x0F) << 4//take 4 bits
			++bi
			buf[bi] = (n3 >> 4) & 0x03//take 2 bits
			//console.log('intermediate2: ' + buf[bi] + ' ' + n4)
			buf[bi] += (n4 & 0x3F) << 2//take 6 bits
			//console.log('intermediate3: ' + buf[bi])
			++bi
		}
	}
	buf.toString = function(){
		//throw new Error('should not auto-convert uuid buffer to string')
		var str = convertBufferUuidToBase64(buf)
		//console.log('converted uuid: ' + str)
		return str
	}
	return buf
}

function convertBufferUuidToBase64(buf){
	var str = ''
	for(var i=0;i<16;i+=3){
		var b1 = buf[i]
		var b2 = buf[i+1]
		var b3 = buf[i+2]

		var n1, n2, n3, n4
		n1 = b1 & 0x3F//take 6 bits
		n2 = (b1 >> 6) & 0x03//take the other 2 bits

		if(i === 15){
			str += base64Chars[n1]
			str += base64Chars[n2]
			//console.log(JSON.stringify([b1, n1, n2]))
			return str
		}
		
		n2 += (b2 & 0x0F) << 2//take 4 more bits
		n3 = (b2 >> 4) & 0x0F//take the other 4 bits
		n3 += (b3 & 0x03) << 4//take 2 more bits
		n4 = (b3 >> 2) & 0x3F//take 6 more bits

		//console.log(JSON.stringify([i,n1,n2,n3,n4,b1,b2,b3,'b',(b2 >> 4) & 0x0F,(b3 & 0x03) << 4]))
		
		if(i === 15){
			str += base64Chars[n1]
			str += base64Chars[n2]
		}else{
		
			str += base64Chars[n1]
			str += base64Chars[n2]
			str += base64Chars[n3]
			str += base64Chars[n4]
		}
	}
	return str
}
/*
function test(){
	function testRoundtrip(uuidStr){
		var buf = convertBase64UuidToBuffer(uuidStr)
		var resUuid = convertBufferUuidToBase64(buf)
		if(resUuid !== uuidStr){
			console.log('buf: ')
			for(var i=0;i<buf.length;++i){
				var b = buf[i]
				console.log(b)
			}
			throw new Error('unit test of base64 conversions fails: ' + uuidStr + ' -> ' + resUuid)
		}
	}
	testRoundtrip('BBBBBBBBBBBBBBBBBBBBBB')
	testRoundtrip('_____________________B')
	testRoundtrip('_____________________A')
	for(var i=0;i<100;++i){
		testRoundtrip(convertBufferUuidToBase64(makeUidByteArray()))
	}
}
test()*/

function makeUid(){
	return convertBufferUuidToBase64(makeUidByteArray())
}

function uuidStringToBuffer(str){
	if(str.length !== 22) throw new Error('invalid uuid string: ' + str)
	var buf = convertBase64UuidToBuffer(str)
	return buf
}

function uuidBufferToString(buf){
	return convertBufferUuidToBase64(buf)
}

/*
function makeUid(){
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
			(r4 >> 30) & 0x03//only include 2 bits in the last char
			];
	
	for(var i=0;i<22;++i){
		uid += base64Chars[p[i]];
	}
	return uid;
}*/

function randomAlpha(many, chars){
	chars = chars || alphaNumericChars;
	var result = '';
	for(var i=0;i<many;++i){
		result += chars[random() % chars.length];
	}
	return result;
}

exports.uuidBufferToString = uuidBufferToString
exports.uuidStringToBuffer = uuidStringToBuffer
exports.uid = makeUid
exports.uidBuffer = makeUidBuffer
exports.alpha = randomAlpha
exports.base64 = randomBase64

