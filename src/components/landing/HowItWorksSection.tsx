import { QrCode, ScanLine, CheckCircle, FileText } from "lucide-react";

const steps = [
  {
    icon: QrCode,
    step: "01",
    title: "Faculty Generates QR",
    description: "Start a session and display the dynamic QR code that refreshes every 120 seconds.",
  },
  {
    icon: ScanLine,
    step: "02",
    title: "Students Scan",
    description: "Students scan the QR code using their mobile device camera.",
  },
  {
    icon: CheckCircle,
    step: "03",
    title: "Verify & Submit",
    description: "Enter roll number and name. System validates location and device.",
  },
  {
    icon: FileText,
    step: "04",
    title: "Export Report",
    description: "Download complete attendance CSV with timestamps and status.",
  },
];

export const HowItWorksSection = () => {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Simple four-step process for seamless attendance tracking
          </p>
        </div>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div
                key={step.step}
                className="relative text-center"
              >
                {/* Step number badge */}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground font-display font-bold text-xl mb-6 relative z-10 shadow-lg">
                  {step.step}
                </div>

                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <step.icon className="w-8 h-8 text-accent" />
                </div>

                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
