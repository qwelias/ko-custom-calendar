( function () {
	"use strict";
	function Calendar( opts ) {
		if ( !( this instanceof Calendar ) ) return new Calendar( opts );

		var self = this;
		this.now = new Date();

		opts = Object.assign( {
			current: this.now,
			locale: 'en-us'
		}, opts );

		this.locale = opts.locale;
		this.events = opts.events;
		this.current = ko.observable( opts.current );

		this.page = {
			_month: ko.observable( this.current().getMonth() ),
			year: this.current().getFullYear()
		};
		this.page = Object.defineProperties( this.page, {
			monthName: {
				enumerable: true,
				get: function () {
					return new Date( this.year, this.month ).toLocaleString( self.locale, {
						month: 'long'
					} );
				}
			},
			month: {
				enumerable: true,
				get: function () {
					return this._month();
				},
				set: function ( val ) {
					if ( val < 12 && val > -1 ) this._month( val );
				}
			},
			days:{
				enumerable: true,
				get: function(){

					var lastDay = parseInt(new Date( this.year, this.month + 1, 0 ).toLocaleString(self.locale, {day:'numeric'}));
					var days = new Array(lastDay).fill(0);
					var i = 1;
					days = days.map(function(){
						return new Date(self.page.year, self.page.month, i++);
					});

					var firstWDay = days[0].getDay();
					var diff = 1 - firstWDay;
					var prevDays = [];
					if(diff == 1){
						new Array(6).fill(0).map(function(v,i){
							prevDays.push(new Date(self.page.year, self.page.month, -i));
						});
					} else if(diff < 0){
						new Array(-diff).fill(0).map(function(v,i){
							prevDays.push(new Date(self.page.year, self.page.month, -i));
						});
					};
					prevDays.reverse();

					var lastWDay = days[days.length-1].getDay();
					var diff = 6 - lastWDay + 1;
					var nextDays = new Array(diff).fill(0).map(function(v,i){
						return new Date(self.page.year, self.page.month, lastDay + i + 1);
					});

					return prevDays.concat(days, nextDays);
				}
			}
		} )
	};
	Calendar.prototype.nextMonth = function () {
		if ( this.page.month + 1 > 11 ) {
			this.page.month = 0;
			++this.page.year;
		} else {
			++this.page.month;
		}
	};
	Calendar.prototype.prevMonth = function () {
		if ( this.page.month - 1 < 0 ) {
			this.page.month = 11;
			--this.page.year;
		} else {
			--this.page.month;
		}
	};
	window.Calendar = Calendar;
} )();
