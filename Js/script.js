
        function calculateRMS() {
            // Get user inputs
            var waveform = document.getElementById("waveform").value;
            var amplitude = parseFloat(document.getElementById("amplitude").value);
            var frequency = parseFloat(document.getElementById("frequency").value);
            var phase = parseFloat(document.getElementById("phase").value);
            var samplesPerSecond = parseFloat(document.getElementById("samplesPerSecond").value);
            var duration = parseFloat(document.getElementById("duration").value);

            // Validate inputs
            if (!validateInputs(amplitude, frequency, phase, samplesPerSecond, duration)) {
                return; // Exit function if validation fails
            }

            // Convert frequency to radians per second
            var omega = 2 * Math.PI * frequency;

            // Calculate RMS DAQ
            var rmsDAQ = amplitude / Math.sqrt(2);

            // Calculate Real RMS one period
            var realRMS = calculateRealRMS(waveform, amplitude, omega, phase, samplesPerSecond, duration);

            // Calculate DAQ RMS Error
            var daqError = Math.abs(realRMS - rmsDAQ);

            // Display results
            document.getElementById("rmsDAQ").value = rmsDAQ.toFixed(3);
            document.getElementById("realRMS").value = realRMS.toFixed(3);
            document.getElementById("daqError").value = daqError.toFixed(3);

            // Calculate RMS DAQ Error (%)
            var rmsError = (daqError / realRMS) * 100;
            document.getElementById("rmsError").value = rmsError.toFixed(1) + "%";

            // Visualize waveform
            visualizeWaveform(waveform, amplitude, frequency, phase, samplesPerSecond, duration);

            // display results 
            var resultsDiv = document.getElementById("results");
            resultsDiv.removeAttribute("hidden");

            // Scroll to the resultsDiv
            resultsDiv.scrollIntoView();

        }

        function calculateRealRMS(waveform, amplitude, omega, phase, samplesPerSecond, duration) {
            // Initialize sum for RMS calculation
            var sum = 0;

            // Number of samples
            var numSamples = Math.floor(samplesPerSecond * duration / 1000);

            // Time per sample
            var dt = 1 / samplesPerSecond;

            for (var i = 0; i < numSamples; i++) {
                // Calculate time at this sample
                var t = i * dt;

                // Calculate the value of the waveform at this time
                var value = calculateWaveformValue(waveform, amplitude, omega, phase, t);

                // Add the square of the value to the sum
                sum += value * value;
            }

            // Calculate RMS using the root mean square formula
            var rms = Math.sqrt(sum / numSamples);

            return rms;
        }

        function calculateWaveformValue(waveform, amplitude, omega, phase, t) {
            switch (waveform) {
                case 'sinus':
                    return amplitude * Math.sin(omega * t + (phase * Math.PI) / 180);
                case 'square':
                    return amplitude * Math.sign(Math.sin(omega * t + (phase * Math.PI) / 180));
                case 'triangle':
                    return (2 * amplitude / Math.PI) * Math.asin(Math.sin(omega * t + (phase * Math.PI) / 180));
                case 'sawtooth':
                    return (2 * amplitude / Math.PI) * Math.atan(1 / Math.tan((omega * t + (phase * Math.PI) / 180) / 2));
                default:
                    return 0;
            }
        }

        function visualizeWaveform(waveform, amplitude, frequency, phase, samplesPerSecond, duration) {
            var ctx = document.getElementById('waveformChart').getContext('2d');

            // Number of samples
            var numSamples = Math.floor(samplesPerSecond * duration / 1000);

            // Time per sample
            var dt = 1 / samplesPerSecond;

            // Arrays to store data for visualization
            var timeArray = [];
            var waveformArray = [];

            for (var i = 0; i < numSamples; i++) {
                // Calculate time at this sample
                var t = i * dt;

                // Calculate the value of the waveform at this time
                var value = calculateWaveformValue(waveform, amplitude, 2 * Math.PI * frequency, phase, t);

                // Add data to arrays
                timeArray.push(t);
                waveformArray.push(value);
            }
            // Set color for the waveform line
            var waveformColor = 'rgba(75, 192, 192, 1)';

            var chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: timeArray,
                datasets: [{
                    label: 'Waveform',
                    data: waveformArray,
                    borderColor: waveformColor,
                    borderWidth: 1,
                    fill: false,
                }]
            },
            options: {
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        grid: {
                            color: 'rgba(255, 255, 255, 0.2)' // Set grid color to a light shade of white
                        },
                        ticks: {
                            color: 'white' // Set axis tick color to white
                        },
                    },
                    y: {
                        min: -amplitude,
                        max: amplitude,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.2)' // Set grid color to a light shade of white
                        },
                        ticks: {
                            color: 'white' // Set axis tick color to white
                        },
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: 'white' // Set legend label color to white
                        }
                    }
                }
            }
        });    
        }
        function validateInputs(amplitude, frequency, phase, samplesPerSecond, duration) {
            if (isNaN(amplitude) || isNaN(frequency) || isNaN(phase) || isNaN(samplesPerSecond) || isNaN(duration)) {
                Swal.fire({
                    title: "Oops!",
                    text: "Please enter valid numeric values for all inputs.",
                    icon: "error"
                });
                return false;
            }

            if (amplitude < 0.01 || amplitude > 5000.0) {
                Swal.fire({
                    title: "Oops!",
                    text: "Amplitude must be between 0.01 and 5000.0.",
                    icon: "error"
                });
                return false;
            }

            if (frequency < 0.1 || frequency > 100000000.0) {
                Swal.fire({
                    title: "Oops!",
                    text: "Frequency must be between 0.1 and 100000000.0.",
                    icon: "error"
                });
                return false;
            }

            if (phase < 0 || phase > 360) {
                Swal.fire({
                    title: "Oops!",
                    text: "Phase must be between 0 and 360.",
                    icon: "error"
                });
                return false;
            }

            if (samplesPerSecond < 1 || samplesPerSecond > 1000000000) {
                Swal.fire({
                    title: "Oops!",
                    text: "Samples per second must be between 1 and 1000000000.",
                    icon: "error"
                });
                return false;
            }

            if (duration < 0.0 || duration > 100000.0) {
                Swal.fire({
                    title: "Oops!",
                    text: "Duration must be between 0.0 and 100000.0.",
                    icon: "error"
                });
                return false;
            }

            return true;
        }