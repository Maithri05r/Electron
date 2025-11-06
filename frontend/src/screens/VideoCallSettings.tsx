import { useState } from 'react';
import { Card } from '../components/ui/card';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Slider } from '../components/ui/slider';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Video, Mic, Volume2, Monitor, Settings2, Wifi, Camera, Save } from 'lucide-react';

interface VideoCallSettingsProps {
  onSave?: (settings: VideoSettings) => void;
}

export interface VideoSettings {
  // Video Settings
  resolution: string;
  frameRate: string;
  videoBitrate: string;
  videoCodec: string;
  camera: string;

  // Audio Settings
  audioCodec: string;
  audioBitrate: string;
  sampleRate: string;
  microphone: string;

  // Network Settings
  bandwidth: string;
  packetLoss: string;

  // Advanced Settings
  hardwareAcceleration: boolean;
  autoAdjustQuality: boolean;
  echoСancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
}

export function VideoCallSettings({ onSave }: VideoCallSettingsProps) {
  const [settings, setSettings] = useState<VideoSettings>({
    resolution: '1920x1080',
    frameRate: '30',
    videoBitrate: '2500',
    videoCodec: 'vp9',
    camera: 'default',
    audioCodec: 'opus',
    audioBitrate: '128',
    sampleRate: '48000',
    microphone: 'default',
    bandwidth: 'unlimited',
    packetLoss: 'auto',
    hardwareAcceleration: true,
    autoAdjustQuality: true,
    echoСancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  });

  const [volume, setVolume] = useState([75]);
  const [micGain, setMicGain] = useState([80]);

  const updateSetting = (key: keyof VideoSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(settings);
    }
  };

  const handleReset = () => {
    setSettings({
      resolution: '1920x1080',
      frameRate: '30',
      videoBitrate: '2500',
      videoCodec: 'vp9',
      camera: 'default',
      audioCodec: 'opus',
      audioBitrate: '128',
      sampleRate: '48000',
      microphone: 'default',
      bandwidth: 'unlimited',
      packetLoss: 'auto',
      hardwareAcceleration: true,
      autoAdjustQuality: true,
      echoСancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    });
    setVolume([75]);
    setMicGain([80]);
  };

  return (
    <div className="flex flex-col h-full p-6 bg-white overflow-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl mb-2" style={{ color: '#2D464D' }}>
          Video Call Settings
        </h1>
        <p style={{ color: '#4D7A82' }}>Configure your video and audio preferences</p>
      </div>

      <Tabs defaultValue="video" className="flex-1">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="video" className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            Video
          </TabsTrigger>
          <TabsTrigger value="audio" className="flex items-center gap-2">
            <Mic className="w-4 h-4" />
            Audio
          </TabsTrigger>
          <TabsTrigger value="network" className="flex items-center gap-2">
            <Wifi className="w-4 h-4" />
            Network
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Settings2 className="w-4 h-4" />
            Advanced
          </TabsTrigger>
        </TabsList>

        {/* Video Settings Tab */}
        <TabsContent value="video" className="space-y-6">
          <Card className="p-6 border" style={{ borderColor: '#C5D9DD' }}>
            <div className="flex items-center gap-3 mb-4">
              <Camera className="w-5 h-5" style={{ color: '#4D7A82' }} />
              <h3 style={{ color: '#2D464D' }}>Video Configuration</h3>
            </div>

            <div className="space-y-4">
              {/* Camera Selection */}
              <div>
                <Label style={{ color: '#4D7A82' }}>Camera Device</Label>
                <Select
                  value={settings.camera}
                  onValueChange={(value) => updateSetting('camera', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default Camera</SelectItem>
                    <SelectItem value="front">Front Camera</SelectItem>
                    <SelectItem value="rear">Rear Camera</SelectItem>
                    <SelectItem value="external">External Webcam</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Resolution */}
              <div>
                <Label style={{ color: '#4D7A82' }}>Resolution</Label>
                <Select
                  value={settings.resolution}
                  onValueChange={(value) => updateSetting('resolution', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3840x2160">4K UHD (3840x2160)</SelectItem>
                    <SelectItem value="2560x1440">QHD (2560x1440)</SelectItem>
                    <SelectItem value="1920x1080">Full HD (1920x1080)</SelectItem>
                    <SelectItem value="1280x720">HD (1280x720)</SelectItem>
                    <SelectItem value="854x480">SD (854x480)</SelectItem>
                    <SelectItem value="640x360">Low (640x360)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs mt-1" style={{ color: '#89B2BA' }}>
                  Higher resolution requires more bandwidth
                </p>
              </div>

              {/* Frame Rate */}
              <div>
                <Label style={{ color: '#4D7A82' }}>Frame Rate (FPS)</Label>
                <Select
                  value={settings.frameRate}
                  onValueChange={(value) => updateSetting('frameRate', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="60">60 FPS</SelectItem>
                    <SelectItem value="30">30 FPS</SelectItem>
                    <SelectItem value="24">24 FPS</SelectItem>
                    <SelectItem value="15">15 FPS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Video Codec */}
              <div>
                <Label style={{ color: '#4D7A82' }}>Video Codec</Label>
                <Select
                  value={settings.videoCodec}
                  onValueChange={(value) => updateSetting('videoCodec', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vp9">VP9 (Recommended)</SelectItem>
                    <SelectItem value="vp8">VP8</SelectItem>
                    <SelectItem value="h264">H.264</SelectItem>
                    <SelectItem value="h265">H.265 (HEVC)</SelectItem>
                    <SelectItem value="av1">AV1</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs mt-1" style={{ color: '#89B2BA' }}>
                  VP9 offers better compression
                </p>
              </div>

              {/* Video Bitrate */}
              <div>
                <Label style={{ color: '#4D7A82' }}>Video Bitrate (kbps)</Label>
                <Select
                  value={settings.videoBitrate}
                  onValueChange={(value) => updateSetting('videoBitrate', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5000">5000 kbps (High)</SelectItem>
                    <SelectItem value="2500">2500 kbps (Medium)</SelectItem>
                    <SelectItem value="1500">1500 kbps (Low)</SelectItem>
                    <SelectItem value="800">800 kbps (Very Low)</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Audio Settings Tab */}
        <TabsContent value="audio" className="space-y-6">
          <Card className="p-6 border" style={{ borderColor: '#C5D9DD' }}>
            <div className="flex items-center gap-3 mb-4">
              <Mic className="w-5 h-5" style={{ color: '#4D7A82' }} />
              <h3 style={{ color: '#2D464D' }}>Audio Configuration</h3>
            </div>

            <div className="space-y-4">
              {/* Microphone Selection */}
              <div>
                <Label style={{ color: '#4D7A82' }}>Microphone Device</Label>
                <Select
                  value={settings.microphone}
                  onValueChange={(value) => updateSetting('microphone', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default Microphone</SelectItem>
                    <SelectItem value="builtin">Built-in Microphone</SelectItem>
                    <SelectItem value="headset">Headset Microphone</SelectItem>
                    <SelectItem value="external">External Microphone</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Volume Control */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label style={{ color: '#4D7A82' }}>Speaker Volume</Label>
                  <span className="text-sm" style={{ color: '#6B9AA4' }}>
                    {volume[0]}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Volume2 className="w-4 h-4" style={{ color: '#4D7A82' }} />
                  <Slider
                    value={volume}
                    onValueChange={setVolume}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Microphone Gain */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label style={{ color: '#4D7A82' }}>Microphone Gain</Label>
                  <span className="text-sm" style={{ color: '#6B9AA4' }}>
                    {micGain[0]}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Mic className="w-4 h-4" style={{ color: '#4D7A82' }} />
                  <Slider
                    value={micGain}
                    onValueChange={setMicGain}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                </div>
              </div>

              <Separator />

              {/* Audio Codec */}
              <div>
                <Label style={{ color: '#4D7A82' }}>Audio Codec</Label>
                <Select
                  value={settings.audioCodec}
                  onValueChange={(value) => updateSetting('audioCodec', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="opus">Opus (Recommended)</SelectItem>
                    <SelectItem value="aac">AAC</SelectItem>
                    <SelectItem value="pcm">PCM (Uncompressed)</SelectItem>
                    <SelectItem value="g722">G.722</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs mt-1" style={{ color: '#89B2BA' }}>
                  Opus provides best quality at low bitrates
                </p>
              </div>

              {/* Audio Bitrate */}
              <div>
                <Label style={{ color: '#4D7A82' }}>Audio Bitrate (kbps)</Label>
                <Select
                  value={settings.audioBitrate}
                  onValueChange={(value) => updateSetting('audioBitrate', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="256">256 kbps (High)</SelectItem>
                    <SelectItem value="128">128 kbps (Medium)</SelectItem>
                    <SelectItem value="64">64 kbps (Low)</SelectItem>
                    <SelectItem value="32">32 kbps (Very Low)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sample Rate */}
              <div>
                <Label style={{ color: '#4D7A82' }}>Sample Rate (Hz)</Label>
                <Select
                  value={settings.sampleRate}
                  onValueChange={(value) => updateSetting('sampleRate', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="48000">48000 Hz</SelectItem>
                    <SelectItem value="44100">44100 Hz</SelectItem>
                    <SelectItem value="32000">32000 Hz</SelectItem>
                    <SelectItem value="16000">16000 Hz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Network Settings Tab */}
        <TabsContent value="network" className="space-y-6">
          <Card className="p-6 border" style={{ borderColor: '#C5D9DD' }}>
            <div className="flex items-center gap-3 mb-4">
              <Wifi className="w-5 h-5" style={{ color: '#4D7A82' }} />
              <h3 style={{ color: '#2D464D' }}>Network Configuration</h3>
            </div>

            <div className="space-y-4">
              {/* Bandwidth Limit */}
              <div>
                <Label style={{ color: '#4D7A82' }}>Bandwidth Limit</Label>
                <Select
                  value={settings.bandwidth}
                  onValueChange={(value) => updateSetting('bandwidth', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unlimited">Unlimited</SelectItem>
                    <SelectItem value="10000">10 Mbps</SelectItem>
                    <SelectItem value="5000">5 Mbps</SelectItem>
                    <SelectItem value="2500">2.5 Mbps</SelectItem>
                    <SelectItem value="1000">1 Mbps</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs mt-1" style={{ color: '#89B2BA' }}>
                  Limit bandwidth usage for slower connections
                </p>
              </div>

              {/* Packet Loss Compensation */}
              <div>
                <Label style={{ color: '#4D7A82' }}>Packet Loss Compensation</Label>
                <Select
                  value={settings.packetLoss}
                  onValueChange={(value) => updateSetting('packetLoss', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto (Recommended)</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Auto Adjust Quality */}
              <div className="flex items-center justify-between">
                <div>
                  <Label style={{ color: '#4D7A82' }}>Auto Adjust Quality</Label>
                  <p className="text-xs mt-1" style={{ color: '#89B2BA' }}>
                    Automatically adjust quality based on network conditions
                  </p>
                </div>
                <Switch
                  checked={settings.autoAdjustQuality}
                  onCheckedChange={(checked) => updateSetting('autoAdjustQuality', checked)}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Advanced Settings Tab */}
        <TabsContent value="advanced" className="space-y-6">
          <Card className="p-6 border" style={{ borderColor: '#C5D9DD' }}>
            <div className="flex items-center gap-3 mb-4">
              <Settings2 className="w-5 h-5" style={{ color: '#4D7A82' }} />
              <h3 style={{ color: '#2D464D' }}>Advanced Options</h3>
            </div>

            <div className="space-y-4">
              {/* Hardware Acceleration */}
              <div className="flex items-center justify-between">
                <div>
                  <Label style={{ color: '#4D7A82' }}>Hardware Acceleration</Label>
                  <p className="text-xs mt-1" style={{ color: '#89B2BA' }}>
                    Use GPU for video encoding/decoding
                  </p>
                </div>
                <Switch
                  checked={settings.hardwareAcceleration}
                  onCheckedChange={(checked) => updateSetting('hardwareAcceleration', checked)}
                />
              </div>

              <Separator />

              {/* Echo Cancellation */}
              <div className="flex items-center justify-between">
                <div>
                  <Label style={{ color: '#4D7A82' }}>Echo Cancellation</Label>
                  <p className="text-xs mt-1" style={{ color: '#89B2BA' }}>
                    Remove echo from audio
                  </p>
                </div>
                <Switch
                  checked={settings.echoСancellation}
                  onCheckedChange={(checked) => updateSetting('echoСancellation', checked)}
                />
              </div>

              {/* Noise Suppression */}
              <div className="flex items-center justify-between">
                <div>
                  <Label style={{ color: '#4D7A82' }}>Noise Suppression</Label>
                  <p className="text-xs mt-1" style={{ color: '#89B2BA' }}>
                    Reduce background noise
                  </p>
                </div>
                <Switch
                  checked={settings.noiseSuppression}
                  onCheckedChange={(checked) => updateSetting('noiseSuppression', checked)}
                />
              </div>

              {/* Auto Gain Control */}
              <div className="flex items-center justify-between">
                <div>
                  <Label style={{ color: '#4D7A82' }}>Auto Gain Control</Label>
                  <p className="text-xs mt-1" style={{ color: '#89B2BA' }}>
                    Automatically adjust microphone volume
                  </p>
                </div>
                <Switch
                  checked={settings.autoGainControl}
                  onCheckedChange={(checked) => updateSetting('autoGainControl', checked)}
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6 pt-6 border-t" style={{ borderColor: '#E8F0F2' }}>
        <Button onClick={handleReset} variant="outline" className="flex-1">
          Reset to Default
        </Button>
        <Button
          onClick={handleSave}
          className="flex-1 text-white"
          style={{ backgroundColor: '#4D7A82' }}
        >
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}
