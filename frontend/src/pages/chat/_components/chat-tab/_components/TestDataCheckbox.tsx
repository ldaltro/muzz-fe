import React from 'react';

interface TestDataCheckboxProps {
  isChecked: boolean;
  onChange: (isChecked: boolean) => void;
}

const TestDataCheckbox: React.FC<TestDataCheckboxProps> = ({ isChecked, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-md">
      <input
        type="checkbox"
        id="test-data-checkbox"
        checked={isChecked}
        onChange={handleChange}
        className="cursor-pointer"
      />
      <label htmlFor="test-data-checkbox" className="text-sm text-gray-700 cursor-pointer">
        Add test data
      </label>
    </div>
  );
};

export default TestDataCheckbox;
