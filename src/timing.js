/**
 * timing.js - Utility code for timing a song
 */

/**
 * TimingInfo expresses the timing sections of a song in terms of offset,
 * beats per minute and beats per measure.
 */
function TimingInfo(direct,inherited){
	this.timingInfo=direct;
	this.trackSpeed=[{offset: 0, speed: 100, beginPos: 0}];
	var prevPos=0;
	var prevTime=0;
	var prevVel=0;
	if((typeof inherited) != "undefined" && inherited.length !=0){
		this.trackSpeed[1]={};
		prevTime=this.trackSpeed[1].offset=inherited[0][0];
		prevVel=this.trackSpeed[1].speed=inherited[0][1];
		prevPos=this.trackSpeed[1].beginPos=prevTime*prevVel;
		this.trackSpeed[0][1]=prevVel;
		for(var i=1;i<inherited.length;i++){
			var newTime=inherited[i].offset;
			var newVel=inherited[i].speed;
			var newPos=prevPos+prevVel*(newTime-prevTime);
			this.trackSpeed[i+1]={};
			this.trackSpeed[i+1].offset=newTime;
			this.trackSpeed[i+1].speed=newVel;
			this.trackSpeed[i+1].beginPos=newPos;
			prevTime=newTime;
			prevVel=newVel;
			prevPos=newPos;
		}
		if(inherited[0][0]==0){
			this.trackSpeed.shift();
		}
	}
}

/**
 * Allows the user to do the timing of notes in a human-readable form
 * instead of needing to manually calculate all the timings themselves.
 */
TimingInfo.prototype.time = function(arr){
	var section=arr[0];
	var bar=arr[1];
	var beat=arr[2];
	if(section==-1){
		return bar;
	}
	else {
		var sect=this.timingInfo[section];
		return sect.offset+(bar*sect.measure+beat)*60.0/sect.bpm;
	}
}

/**
 * Returns the position of a time on a variable-speed track.
 */
TimingInfo.prototype.trackPos = function(time){
	var i=1;
	while((i<this.trackSpeed.length)&&(time>=this.trackSpeed[i].offset)){
		i++;
	}
	return this.trackSpeed[i-1].beginPos+(time-this.trackSpeed[i-1].offset)*this.trackSpeed[i-1].speed;
}

/**
 * Converts, in place, a note to its position on a variable-speed track, given
 * that convert1() has already been applied to it.
 */
TimingInfo.prototype.convert = function(note){
	this.convert1(note);
	this.convert2(note);
}

TimingInfo.prototype.convertAll = function(noteList){
	this.convertAll1(noteList);
	this.convertAll2(noteList);
}

/**
 * Converts, in place, a note from human-readable form [section,bar,beat]
 * to its raw timing value.
 */
TimingInfo.prototype.convert1 = function(note){
	if(note.noteType=="LN"){
		this.convertAll1(note.notes);
	} else {
		note.time=this.time(note.time);
	}
}

/**
 * Converts, in place, a whole array of notes from human-readable form
 * [section,bar,beat] to its raw timing value.
 */
TimingInfo.prototype.convertAll1 = function(noteList){
	for(var i=0;i<noteList.length;i++){
		this.convert1(noteList[i]);
	}
}
			
/**
 * Converts a note to its position on a variable-speed track, given
 * that convert1() has already been applied to it.
 */
TimingInfo.prototype.convert2 = function(note){
	if(note.noteType=="LN"){
		this.convertAll2(note.notes);
	} else {
		note.time=this.trackPos(note.time);
	}
}

TimingInfo.prototype.convertAll2 = function(noteList){
	for(var i=0;i<noteList.length;i++){
		this.convert2(noteList[i]);
	}
}

/**
 * Attempts to convert a note from its time back to its human readable form.
 * 
 */
TimingInfo.prototype.fromTime = function(time){
	var i=0;
	while((i<this.timingInfo.length) && (time <= this.timingInfo[i].offset)){
		console.log(i);
		i++;
	}
	var section=this.timingInfo[Math.min(i,this.timingInfo.length-1)];
	var beats=(time-section.offset)/(60.0/section.bpm);
	var barN=Math.floor(beats/section.measure);
	var noteN=beats-section.measure*barN;
	return [i,barN,noteN];
}
