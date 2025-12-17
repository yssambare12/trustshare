import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function ExpiryDatePicker({ onDateSelect, selectedDate }) {
  const [showPicker, setShowPicker] = useState(false);

  const handleDateChange = (date) => {
    onDateSelect(date);
  };

  const clearDate = () => {
    onDateSelect(null);
    setShowPicker(false);
  };

  const minDate = new Date();
  minDate.setHours(minDate.getHours() + 1);

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Set Expiry Date (Optional)
      </label>

      {!showPicker && !selectedDate && (
        <button
          onClick={() => setShowPicker(true)}
          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium border border-gray-300"
        >
          + Add Expiry Date
        </button>
      )}

      {(showPicker || selectedDate) && (
        <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="MMMM d, yyyy h:mm aa"
            minDate={minDate}
            placeholderText="Select date and time"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            inline={showPicker && !selectedDate}
          />

          {selectedDate && (
            <div className="mt-2 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Expires: {selectedDate.toLocaleString()}
              </p>
              <button
                onClick={clearDate}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-gray-500 mt-2">
        If set, this share will expire and become inaccessible after the selected date and time.
      </p>
    </div>
  );
}

export default ExpiryDatePicker;
