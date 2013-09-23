
exports.module = module

var random;
var randomByte;
var randomTwoBytes;

require('./../seedrandom/seedrandom');

random = function(){return Math.floor(Math.random()*2147483648);}

randomByte = function(){return Math.floor(Math.random()*256);}
randomTwoBytes = function(){return Math.floor(Math.random()*65536);}


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


function convertStringUuidToBase64(uuidStr){
	var str = ''
	var buf = []
	for(var i=0;i<8;++i){
		var c = uuidStr.charCodeAt(i)
		buf.push(c & 0xFF)
		buf.push((c>>8) & 0xFF)
	}
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
			//console.log(uuidStr + ' -> ' + str)
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
		var stringRep = uuidBufferToString(buf)
		var otherResUuid = convertBufferUuidToBase64(uuidStringToBuffer(stringRep))
		if(resUuid !== uuidStr || otherResUuid !== uuidStr){
			console.log('buf: ')
			for(var i=0;i<buf.length;++i){
				var b = buf[i]
				console.log(b)
			}
			throw new Error('unit test of base64 conversions fails: ' + uuidStr + ' -> ' + resUuid + ' | ' + otherResUuid + ' ' + stringRep)
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
	//return convertBufferUuidToBase64(makeUidByteArray())
	return String.fromCharCode(
		randomTwoBytes(),
		randomTwoBytes(),
		
		randomTwoBytes(),
		randomTwoBytes(),
		
		randomTwoBytes(),
		randomTwoBytes(),
		
		randomTwoBytes(),
		randomTwoBytes()
	)
}

function uuidBase64StringToBuffer(str){
	if(str.length !== 22) throw new Error('invalid uuid string: ' + str)
	var buf = convertBase64UuidToBuffer(str)
	return buf
}

function uuidBufferToBase64(buf){
	return convertBufferUuidToBase64(buf)
}

function uuidStringToBuffer(str){
	var buf = new Buffer(16)
	var i=0
	for(var ci=0;ci<8;++ci){
		var c = str.charCodeAt(ci)
		buf[i++] = c & 0xFF
		buf[i++] = (c>>8) & 0xFF
	}
	return buf
}
function uuidBufferToString(buf){
	return String.fromCharCode(
		buf[0]|(buf[1]<<8),
		buf[2]|(buf[3]<<8),
		buf[4]|(buf[5]<<8),
		buf[6]|(buf[7]<<8),
		buf[8]|(buf[9]<<8),
		buf[10]|(buf[11]<<8),
		buf[12]|(buf[13]<<8),
		buf[14]|(buf[15]<<8))
}
function uuidBufferSliceToString(buf, off){
	return String.fromCharCode(
		buf[off]|(buf[off+1]<<8),
		buf[off+2]|(buf[off+3]<<8),
		buf[off+4]|(buf[off+5]<<8),
		buf[off+6]|(buf[off+7]<<8),
		buf[off+8]|(buf[off+9]<<8),
		buf[off+10]|(buf[off+11]<<8),
		buf[off+12]|(buf[off+13]<<8),
		buf[off+14]|(buf[off+15]<<8))
}
/*
function uuidBase64ToString(base64Str){
	var res = uuidBufferToString(uuidBase64StringToBuffer(base64Str))
	console.log(base64Str + ' -> ' + res)
	return res
}*/


function uuidBase64ToString(uuidStr){
	//return uuidBufferToString(uuidBase64StringToBuffer(base64Str))
	var buf = []//new Buffer(16)
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
			//console.log('intermediate1: ' + buf[bi] + ' (' + ((n2 & 0x03)) + ')')
			buf[bi] += (n3 & 0x0F) << 4//take 4 bits
			++bi
			buf[bi] = (n3 >> 4) & 0x03//take 2 bits
			//console.log('intermediate2: ' + buf[bi] + ' ' + n4)
			buf[bi] += (n4 & 0x3F) << 2//take 6 bits
			//console.log('intermediate3: ' + buf[bi])
			++bi
		}
	}
	return uuidBufferToString(buf)
}

function uuidStringToBase64(str){
	return convertStringUuidToBase64(str)
}
/*
function uuidStringToBase64(str){
	return uuidBufferToBase64(uuidStringToBuffer(str))
}*/

function writeUuidToBuffer(uuid, buf, off){
	var i=off
	for(var ci=0;ci<8;++ci){
		var c = uuid.charCodeAt(ci)
		buf[(i++)] = c & 0xFF
		buf[(i++)] = (c>>8) & 0xFF
	}
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

exports.uuidBufferToBase64 = uuidBufferToBase64
exports.uuidStringToBuffer = uuidStringToBuffer
exports.uuidBufferSliceToString = uuidBufferSliceToString
exports.uuidBufferToString = uuidBufferToString
exports.uuidBase64ToString = uuidBase64ToString
exports.uuidStringToBase64 = uuidStringToBase64
exports.uid = makeUid
exports.writeUuidToBuffer = writeUuidToBuffer
//exports.uidBuffer = makeUidBuffer
exports.alpha = randomAlpha
exports.base64 = randomBase64

