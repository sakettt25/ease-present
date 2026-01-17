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
    <section className="py-24 bg-gray-950">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Simple four-step process for seamless attendance tracking
          </p>
        </div>

        <div className="relative">
          {/* Connection line with gradient */}
          <div className="hidden lg:block absolute top-20 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent -translate-y-1/2" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {steps.map((step, index) => (
              <div
                key={step.step}
                className="relative text-center group"
              >
                {/* Step number badge with animation */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white font-display font-bold text-2xl mb-6 relative z-10 shadow-xl shadow-blue-500/20 group-hover:shadow-2xl group-hover:shadow-blue-500/30 group-hover:scale-110 transition-all duration-300">
                  <div className="absolute inset-0 rounded-3xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative">{step.step}</span>
                </div>

                {/* Icon with background */}
                <div className="flex justify-center mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                    <step.icon className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
                  </div>
                </div>

                <h3 className="font-display text-xl font-semibold text-white mb-3 group-hover:text-blue-400 transition-colors">
                  {step.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
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
