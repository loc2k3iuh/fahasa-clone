
import './ToggleSwitch.css'; // Import file CSS (nếu bạn muốn tách CSS)
interface ToggleSwitchProps {
  checked: boolean; // dùng checked thay vì defaultChecked
  onChange?: () => void; // bỏ truyền giá trị, chỉ gọi callback
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange }) => {
  return (
    <label className="toggle-switch">
      <input
        type="checkbox"
        className="toggle-switch-input"
        checked={checked}
        onChange={onChange} // không thay đổi gì ở đây
      />
      <span className="toggle-switch-slider"></span>
    </label>
  );
};



export default ToggleSwitch;
