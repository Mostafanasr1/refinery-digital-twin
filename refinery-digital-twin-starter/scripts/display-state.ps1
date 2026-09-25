$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public class MeasurementState {
  [StructLayout(LayoutKind.Sequential)] public struct Power {
    public byte ACLineStatus, BatteryFlag, BatteryLifePercent, SystemStatusFlag;
    public uint BatteryLifeTime, BatteryFullLifeTime;
  }
  [DllImport("kernel32.dll")] public static extern bool GetSystemPowerStatus(out Power status);
  [DllImport("user32.dll", CharSet=CharSet.Unicode)] static extern bool EnumDisplaySettingsEx(string name, int mode, IntPtr data, uint flags);
  public static int[] DisplayMode(string name) {
    IntPtr data=Marshal.AllocHGlobal(220);
    try {
      for(int i=0;i<220;i++) Marshal.WriteByte(data,i,0);
      Marshal.WriteInt16(data,68,220);
      if(!EnumDisplaySettingsEx(name,-1,data,0)) throw new Exception("Cannot read active display mode");
      return new[]{Marshal.ReadInt32(data,172),Marshal.ReadInt32(data,176),Marshal.ReadInt32(data,184)};
    } finally { Marshal.FreeHGlobal(data); }
  }
}
'@
$taskPower=New-Object MeasurementState+Power
if (-not [MeasurementState]::GetSystemPowerStatus([ref]$taskPower)) { throw 'Power state unavailable' }
$taskDisplays=@([System.Windows.Forms.Screen]::AllScreens | ForEach-Object {
  $mode=[MeasurementState]::DisplayMode($_.DeviceName)
  [ordered]@{device=$_.DeviceName;primary=$_.Primary;width=$mode[0];height=$mode[1];refreshHz=$mode[2]}
})
$taskConnections=@(Get-CimInstance -Namespace root/wmi -ClassName WmiMonitorConnectionParams | Where-Object Active | Select-Object InstanceName,VideoOutputTechnology)
[ordered]@{
  capturedAt=[DateTime]::UtcNow.ToString('o')
  acConnected=($taskPower.ACLineStatus -eq 1)
  batteryPercent=$taskPower.BatteryLifePercent
  powerPlan=(powercfg /getactivescheme | Out-String).Trim()
  displays=$taskDisplays
  connections=$taskConnections
  noExternalMonitor=($taskDisplays.Count -eq 1 -and @($taskConnections | Where-Object { $_.VideoOutputTechnology -ne 2147483648 -and $_.VideoOutputTechnology -ne 11 }).Count -eq 0)
} | ConvertTo-Json -Depth 6
