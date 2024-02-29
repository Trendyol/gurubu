import "../../styles/metricToggle/style.scss";

interface IProps {
  text: string;
}
export const MetricToggleTooltip= ({text}: IProps) => { 
  
    return (
      <div className='toggle-tooltip'>
        <div className='toggle-tooltip__text'>{text}</div>
      </div>
    );
  };
  