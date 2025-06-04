export default function Footer() {
  return (
    <footer className="bg-muted/50 py-6 mt-12">
      <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} Ozonxt Aqua Hub. All rights reserved.</p>
        <p className="mt-1">Your Partner in Pure Water Solutions.</p>
      </div>
    </footer>
  );
}
