if (window.jQuery && window.LIB) {

	jQuery(function($) {

		var TOTAL_USERS = "TotalUsers";
		var ACTIVE_USERS = "ActiveUsersByDay";


		var RATIO_PRECISION = 3;
		var HTML_TABLE_ID = "lib-user-ratio-table";
		var HTML_RATIO_ID = "lib-user-ratio";
		var HTML_FORM_ID = "lib-form";
		var HTML_FORM_START_DATE_ID = "lib-start-date";
		var HTML_FORM_START_END_ID = "lib-end-date";

		/**
		 *
		 */
		var calculate = function(start_date, end_date) {

			if (!start_date || isNaN(Date.parse(start_date)) ) {
				start_date = "0000-00-00";
			}
			if (!end_date || isNaN(Date.parse(end_date)) ) {
				end_date = "9999-99-99";
			}

			// keep track of which date range will be displayed
			var data_date_start = null;
			var data_date_end = null;

			var total_users_running_total = 0;
			var active_users_running_total = 0;

			var totalusers_day = LIB.getNextDay(TOTAL_USERS);
			var activeusers_day = LIB.getNextDay(ACTIVE_USERS);
			while (totalusers_day && activeusers_day) {

				var totalusers_date = totalusers_day['@date'];
				var activeusers_date = activeusers_day['@date'];

				if (totalusers_date > end_date) {
					break;
				} else if (totalusers_date >= start_date) {

					// set the value of the first date that will be displayed
					if (!data_date_start) {
						data_date_start = totalusers_date;
					}
					// set the value of the last date that will be displayed (updated in each iteration)
					data_date_end = totalusers_date;

					// Add a row to the data table.
					var total_users_num = new Number(totalusers_day['@value']).valueOf();
					total_users_running_total += total_users_num;
					var active_users_num = new Number(activeusers_day['@value']).valueOf();
					active_users_running_total += active_users_num;
					var day_ratio = new Number(active_users_num / total_users_num).toFixed(RATIO_PRECISION);
					var row = $('<tr></tr>');
					// date
					var date_cell = $('<td></td>');
					date_cell.text(totalusers_date);
					row.append(date_cell);
					// total users
					row.append( $('<td></td>').text(total_users_num) );
					// active users
					row.append( $('<td></td>').text(active_users_num) );
					// day's ratio
					row.append( $('<td></td>').text(day_ratio) );
					// inject the rows
					var tbody = $('#' + HTML_TABLE_ID + ' tbody');
					tbody.append(row);
				}
				totalusers_day = LIB.getNextDay(TOTAL_USERS);
				activeusers_day = LIB.getNextDay(ACTIVE_USERS);

			} // end while()

			var total_user_ratio = new Number(active_users_running_total / total_users_running_total).toFixed(RATIO_PRECISION);
			$('#' + HTML_RATIO_ID).text(total_user_ratio);

			$('#' + HTML_TABLE_ID + ' caption > span').text(data_date_start + " to " + data_date_end);

		}; // end calculate()


		// handle the form (and subsequent table display) when Flurry indicates it's ready
		$(document).on('LIB_ready', function() {
			$('#' + HTML_FORM_ID).submit(function(submit_event) {
				// prevent a page reload
				submit_event.preventDefault();
				$('#' + HTML_TABLE_ID + ' tbody').empty();
				var start = $('#' + HTML_FORM_START_DATE_ID).attr('value');
				var end = $('#' + HTML_FORM_START_END_ID).attr('value');
				LIB.reset();
				calculate(start, end);
				return false;
			});
		});

		// initialize Flurry when triggered
		$(document).on("LIB.paths.ready", function(event, paths) {
			LIB.init(paths);
		});

		// Read the paths.json file
		$.getJSON("paths.json", function(data) {
			jQuery(document).trigger("LIB.paths.ready", data);
		});

	}); // end document ready
}
