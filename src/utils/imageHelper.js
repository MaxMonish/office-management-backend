export const getImageUrl = (path) => {
    if (!path) return "/default-avatar.png";

    if (path.startsWith("http")) return path;

    return `http://localhost:5000${path}`;
};