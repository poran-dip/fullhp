// Function to generate a random, consistent background color based on the first letter
const getBackgroundColor = (letter: string) => {
  const colors = [
    "#F44336", // Red
    "#E91E63", // Pink
    "#9C27B0", // Purple
    "#673AB7", // Deep Purple
    "#3F51B5", // Indigo
    "#2196F3", // Blue
    "#03A9F4", // Light Blue
    "#00BCD4", // Cyan
    "#009688", // Teal
    "#4CAF50", // Green
    "#8BC34A", // Light Green
    "#CDDC39", // Lime
    "#FFC107", // Amber
    "#FF9800", // Orange
    "#FF5722", // Deep Orange
    "#795548", // Brown
  ];

  // Use the ASCII value of the letter to consistently select a color
  const colorIndex = letter.toUpperCase().charCodeAt(0) % colors.length;
  return colors[colorIndex];
};

// Initial Avatar Component
const InitialAvatar = ({
  name = "",
  size = 40,
  fontSize = 16,
  fontColor = "white",
}) => {
  // Get the first letter of the name (or use a default)
  const initial = name ? name.charAt(0).toUpperCase() : "?";

  // Generate a consistent background color
  const backgroundColor = getBackgroundColor(initial);

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        backgroundColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: fontColor,
        fontWeight: "bold",
        fontSize: `${fontSize}px`,
        userSelect: "none",
      }}
    >
      {initial}
    </div>
  );
};

export default InitialAvatar;
