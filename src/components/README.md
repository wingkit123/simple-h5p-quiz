# PortraitFullscreenH5P Component

A reusable React component that enables portrait fullscreen behavior for H5P standalone content.

## Features

- ✅ User-triggered fullscreen button
- ✅ Portrait orientation lock using Screen Orientation API
- ✅ CSS fallbacks for unsupported orientation lock
- ✅ Cross-browser fullscreen support (standard + WebKit fallbacks)
- ✅ Auto-detection of H5P elements or custom target selector
- ✅ Clean exit handling and orientation unlock
- ✅ No global state pollution (single CSS class on documentElement)
- ✅ No modifications to H5P library files required
- ✅ Works with both embedded DOM nodes and iframes

## Usage

```jsx
import PortraitFullscreenH5P from "./components/PortraitFullscreenH5P";
import "./components/portrait-fullscreen.css";

function MyH5PPage() {
  return (
    <PortraitFullscreenH5P
      targetSelector=".h5p-container"
      buttonLabel="Go Portrait Fullscreen"
      onError={(error) => console.error("Fullscreen error:", error)}
    >
      <div className="h5p-host">
        <div className="h5p-container">{/* Your H5P content here */}</div>
      </div>
    </PortraitFullscreenH5P>
  );
}
```

## Props

| Prop             | Type       | Default                       | Description                                                |
| ---------------- | ---------- | ----------------------------- | ---------------------------------------------------------- |
| `targetSelector` | `string`   | `null`                        | CSS selector for H5P element. Auto-detects if not provided |
| `buttonLabel`    | `string`   | `"Enter portrait fullscreen"` | Button text/aria-label                                     |
| `className`      | `string`   | `""`                          | Additional CSS classes for wrapper                         |
| `onError`        | `function` | `null`                        | Error callback `(error) => void`                           |

## Auto-Detection

When `targetSelector` is not provided, the component searches for:

1. `.h5p-iframe`
2. `.h5p-container`
3. First `iframe` element
4. Falls back to wrapper element

## Browser Support

### Fullscreen API

- ✅ Chrome/Edge: `requestFullscreen()`
- ✅ Safari: `webkitRequestFullscreen()`
- ✅ Legacy IE: `msRequestFullscreen()`

### Orientation Lock

- ✅ Modern browsers: `screen.orientation.lock()`
- ✅ Legacy Firefox: `screen.mozLockOrientation()`
- ✅ Legacy IE: `screen.msLockOrientation()`
- ✅ CSS fallback: `transform: rotate(90deg)` in landscape

## CSS Classes Applied

- `h5p-portrait-fullscreen-active` on `document.documentElement` during fullscreen
- Forces viewport dimensions and neutralizes H5P transforms
- Hides controls during fullscreen to prevent interference

## Known Limitations

1. **Cross-origin iframes**: Orientation lock may fail due to security restrictions
2. **iOS Safari**: Screen Orientation API support varies by version
3. **H5P library overrides**: Some H5P content types may have conflicting CSS
4. **Landscape-only content**: CSS rotation may not work perfectly for all H5P types

## Error Handling

The component handles errors gracefully:

- Logs debug info to console with `[PortraitFullscreenH5P]` prefix
- Calls `onError` prop if provided
- Continues with CSS fallbacks when orientation lock fails
- Cleans up properly on any failure

## Acceptance Criteria

✅ Button triggers fullscreen on user gesture  
✅ Attempts portrait orientation lock  
✅ Applies CSS fallbacks for unsupported features  
✅ Cleans up on fullscreen exit (user ESC key)  
✅ Works with iframe and DOM-embedded H5P  
✅ No H5P library modifications required  
✅ Cross-browser compatible  
✅ Minimal performance impact  
✅ Accessible (ARIA labels, keyboard support)

## Debugging

Enable debug logs by checking browser console for messages prefixed with `[PortraitFullscreenH5P]`.

## Integration Example

```jsx
// In your main App.jsx
import PortraitFullscreenH5P from "./components/PortraitFullscreenH5P";
import "./components/portrait-fullscreen.css";

// Wrap existing H5PPlayer
<PortraitFullscreenH5P>
  <H5PPlayer h5pPath="/h5p/my-content" embedType="iframe" />
</PortraitFullscreenH5P>;
```
