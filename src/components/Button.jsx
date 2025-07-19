export default function Button({ children, className, ...props }) {
    return (
    <button
        className={`px-4 py-2 bg-olive-drab text-white rounded-lg hover:bg-opacity-90 transition ${className}`}
        {...props}
    >
        {children}
    </button>
    );
}