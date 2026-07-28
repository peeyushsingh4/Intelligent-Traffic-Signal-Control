import matplotlib.pyplot as plt
import os
import pandas as pd
from typing import Dict, List, Any, Optional

class TrafficVisualizer:
    """Uses matplotlib and plotly for visualization."""
    
    def __init__(self, config: Optional[Any] = None):
        self.config = config
        try:
            plt.style.use('seaborn-v0_8-whitegrid')
        except Exception:
            plt.style.use('default')
            
        self.colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd']
        self.figures = {}
        
    def plot_training_rewards(self, rewards: List[float], title: str = "Training Rewards") -> plt.Figure:
        """Plot training curve."""
        fig, ax = plt.subplots(figsize=(10, 6))
        
        ax.plot(rewards, alpha=0.3, color=self.colors[0], label='Raw Reward')
        
        window = min(100, max(1, len(rewards) // 5))
        if len(rewards) >= window:
            moving_avg = pd.Series(rewards).rolling(window=window).mean()
            ax.plot(moving_avg, color=self.colors[0], linewidth=2, label=f'Moving Avg ({window})')
            
        ax.set_title(title)
        ax.set_xlabel('Episodes')
        ax.set_ylabel('Reward')
        ax.legend()
        
        self.figures['training_rewards'] = fig
        return fig

    def plot_comparison_bar(self, metrics_dict: Dict[str, float], metric_name: str) -> plt.Figure:
        """Bar chart comparing methods."""
        fig, ax = plt.subplots(figsize=(8, 5))
        methods = list(metrics_dict.keys())
        values = list(metrics_dict.values())
        
        ax.bar(methods, values, color=self.colors[:len(methods)])
        ax.set_title(f'Comparison of {metric_name}')
        ax.set_ylabel(metric_name)
        
        safe_name = metric_name.replace(" ", "_").replace("(", "").replace(")", "").replace("₂", "2")
        self.figures[f'comparison_{safe_name}'] = fig
        return fig

    def plot_cumulative_emissions(self, emission_data_dict: Dict[str, List[float]]) -> plt.Figure:
        """Cumulative CO2 line chart over time."""
        fig, ax = plt.subplots(figsize=(10, 6))
        
        for i, (method, emissions) in enumerate(emission_data_dict.items()):
            cumulative = pd.Series(emissions).cumsum()
            ax.plot(cumulative, label=method, color=self.colors[i % len(self.colors)], linewidth=2)
            
        ax.set_title('Cumulative CO2 Emissions')
        ax.set_xlabel('Time Steps')
        ax.set_ylabel('CO2 Emissions (mg)')
        ax.legend()
        
        self.figures['cumulative_emissions'] = fig
        return fig

    def plot_emission_breakdown(self, emission_summary: Dict[str, float]) -> plt.Figure:
        """Pie chart of CO2/CO/NOx/PM."""
        fig, ax = plt.subplots(figsize=(8, 8))
        labels = list(emission_summary.keys())
        sizes = list(emission_summary.values())
        
        ax.pie(sizes, labels=labels, autopct='%1.1f%%', startangle=90, colors=self.colors)
        ax.axis('equal')
        ax.set_title('Emission Breakdown')
        
        self.figures['emission_breakdown'] = fig
        return fig

    def plot_queue_lengths_over_time(self, queue_data: Dict[str, List[float]]) -> plt.Figure:
        """Line plot of queue lengths."""
        fig, ax = plt.subplots(figsize=(10, 6))
        
        for i, (direction, queues) in enumerate(queue_data.items()):
            ax.plot(queues, label=direction, alpha=0.7)
            
        ax.set_title('Queue Lengths Over Time')
        ax.set_xlabel('Time Steps')
        ax.set_ylabel('Queue Length (vehicles)')
        ax.legend()
        
        self.figures['queue_lengths'] = fig
        return fig

    def plot_ev_response_analysis(self, ev_metrics: Dict[str, float]) -> plt.Figure:
        """EV-specific metrics."""
        fig, ax = plt.subplots(figsize=(8, 5))
        metrics = list(ev_metrics.keys())
        values = list(ev_metrics.values())
        
        ax.bar(metrics, values, color=['#d62728', '#2ca02c', '#1f77b4'])
        ax.set_title('Emergency Vehicle Response Metrics')
        ax.set_ylabel('Time / Count')
        
        self.figures['ev_response'] = fig
        return fig

    def plot_environmental_impact_infographic(self, impact_data: Dict[str, float]) -> plt.Figure:
        """Trees/fuel/cars infographic proxy using text/bar."""
        fig, ax = plt.subplots(figsize=(10, 4))
        
        text = (
            f"Environmental Impact Savings:\n\n"
            f"🌳 Trees Equivalent: {impact_data.get('trees', impact_data.get('trees_equivalent_yearly', 0)):.1f}\n"
            f"⛽ Fuel Saved (L): {impact_data.get('fuel_saved', impact_data.get('liters_gasoline_saved', 0)):.1f}\n"
            f"🚗 Cars Removed: {impact_data.get('cars_removed', impact_data.get('cars_off_road_equivalent', 0)):.1f}"
        )
        
        ax.text(0.5, 0.5, text, fontsize=14, ha='center', va='center', 
                bbox=dict(boxstyle="round,pad=1", facecolor='#eaffea', edgecolor='#2ca02c'))
        
        ax.axis('off')
        self.figures['env_impact'] = fig
        return fig

    def save_all_plots(self, output_dir: str) -> None:
        """Saves all generated plots."""
        os.makedirs(output_dir, exist_ok=True)
        for name, fig in list(self.figures.items()):
            try:
                fig.savefig(os.path.join(output_dir, f"{name}.png"), bbox_inches='tight', dpi=300)
            except Exception:
                pass
            finally:
                plt.close(fig)
