import React from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  CameraRoll,
  ScrollView,
  Dimensions,
  Image,
  StatusBar,
  Animated,
} from 'react-native';
import { Camera, Permissions } from 'expo';
import { MaterialIcons } from '@expo/vector-icons';

export default class CameraExample extends React.Component {
  state = {
    hasCameraPermission: null,
    type: Camera.Constants.Type.back,
    images: [],
    scrollX: new Animated.Value(0),
  };

  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
    this.refresh();
  }

  refresh() {
    CameraRoll.getPhotos({ first: 10 }).then(({ edges }) => {
      this.setState({ images: edges.map(edge => edge.node.image) });
    });
  }

  snap() {
    if (this.camera) {
      this.camera.takePictureAsync().then(uri => {
        CameraRoll.saveToCameraRoll(uri).then(newUri => {
          this.refresh();
        });
      });
    }
  }

  render() {
    const { hasCameraPermission } = this.state;
    const { width, height } = Dimensions.get('window');
    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      const minScale = 1;
      const maxScale = 2;
      const scale1 = this.state.scrollX.interpolate({
        inputRange: [0, width],
        outputRange: [maxScale, minScale],
        extrapolate: 'clamp',
      });
      const scale2 = this.state.scrollX.interpolate({
        inputRange: [0, width, width * 2],
        outputRange: [minScale, maxScale, minScale],
        extrapolate: 'clamp',
      });
      const scale3 = this.state.scrollX.interpolate({
        inputRange: [width, width * 2],
        outputRange: [minScale, maxScale],
        extrapolate: 'clamp',
      });

      const iconProps = {
        size: 30,
        color: 'white',
      };

      return (
        <View style={{ flex: 1 }}>
          <Animated.View
            style={{
              position: 'absolute',
              top: 20,
              left: 0,
              zIndex: 100,
              width: width * 2,
              height: height / 10,
              paddingLeft: width / 2,
              paddingRight: width / 2,
              transform: [
                {
                  translateX: Animated.multiply(
                    new Animated.Value(-0.5),
                    this.state.scrollX
                  ),
                },
              ],
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Animated.View
              style={{
                backgroundColor: 'transparent',
                transform: [{ scale: scale1 }],
              }}>
              <MaterialIcons name={'people'} {...iconProps} />
            </Animated.View>
            <Animated.View
              style={{
                backgroundColor: 'transparent',
                transform: [{ scale: scale2 }],
              }}>
              <MaterialIcons name={'camera-alt'} {...iconProps} />
            </Animated.View>
            <Animated.View
              style={{
                backgroundColor: 'transparent',
                transform: [{ scale: scale3 }],
              }}>
              <MaterialIcons name={'camera-roll'} {...iconProps} />
            </Animated.View>
          </Animated.View>
          <ScrollView
            horizontal
            pagingEnabled
            scrollEventThrottle={1}
            onScroll={Animated.event(
              [
                {
                  nativeEvent: {
                    contentOffset: {
                      x: this.state.scrollX,
                    },
                  },
                },
              ]
              //{ useNativeDriver: true }
            )}
            showsHorizontalScrollIndicator={false}>
            <StatusBar hidden />
            <View style={{ backgroundColor: 'pink', width, height }} />
            <Camera
              ref={ref => {
                this.camera = ref;
              }}
              style={{ width, height }}
              type={this.state.type}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}>
                {/* <TouchableOpacity
                  style={{
                    flex: 0.1,
                    alignSelf: 'flex-end',
                    alignItems: 'center',
                  }}
                  onPress={() => {
                    this.setState({
                      type:
                        this.state.type === Camera.Constants.Type.back
                          ? Camera.Constants.Type.front
                          : Camera.Constants.Type.back,
                    });
                  }}>
                  <Text
                    style={{ fontSize: 18, marginBottom: 10, color: 'white' }}>
                    {' '}Flip{' '}
                  </Text>
                </TouchableOpacity> */}
                <TouchableOpacity
                  style={{
                    flex: 1,
                    alignSelf: 'flex-end',
                    marginBottom: 20,
                    alignItems: 'center',
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  onPress={this.snap.bind(this)}>
                  <MaterialIcons name={'lens'} size={80} color={'white'} />
                </TouchableOpacity>
              </View>
            </Camera>
            <View style={{ backgroundColor: 'yellow', width, height }}>
              <ScrollView pagingEnabled showsVerticalScrollIndicator={false}>
                {this.state.images.map(image =>
                  <Image
                    key={image.uri}
                    style={{ width, height }}
                    source={{ uri: image.uri }}
                  />
                )}
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      );
    }
  }
}
