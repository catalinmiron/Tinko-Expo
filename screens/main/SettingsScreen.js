import React from 'react';
import Me from './MeScreen';

export default class SettingsScreen extends React.Component {
  static navigationOptions = {
    header:null
  };

  render() {
    return <Me />;
  }
}
