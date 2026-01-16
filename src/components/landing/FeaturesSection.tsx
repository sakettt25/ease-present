import { MapPin, Smartphone, Clock, Shield, FileSpreadsheet, Users } from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "Location Verification",
    description: "Students must be within 50 meters of the faculty's location to mark attendance.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Smartphone,
    title: "Device Fingerprinting",
    description: "Each device can submit attendance only once per session, blocking proxy attempts.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Clock,
    title: "QR Code Expiry",
    description: "Dynamic QR codes with 120-second validity and one-time use tokens.",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    icon: Shield,
    title: "Anti-Fraud Protection",
    description: "50-minute cooldown after successful submission prevents re-attempts.",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
  {
    icon: FileSpreadsheet,
    title: "CSV Reports",
    description: "Automatically generate detailed attendance reports with timestamps.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Users,
    title: "Student Verification",
    description: "Cross-check roll numbers and names against official student lists.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Comprehensive Anti-Fraud System
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Multiple layers of verification ensure genuine attendance tracking
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 bg-card rounded-2xl border border-border hover:border-accent/30 hover-lift cursor-default"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
