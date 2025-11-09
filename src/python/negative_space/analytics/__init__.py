"""
Analytics Package Initialization

Top-level module for the analytics engine.
"""

from . import core
from .config import (
    AnalyticsConfig,
    EnvironmentType,
    get_config,
    set_config,
    reset_config,
)
from .core import (
    Event,
    EventType,
    EventBus,
    Metric,
    MetricType,
    MetricsCollector,
)

__version__ = "0.1.0"

__all__ = [
    "AnalyticsConfig",
    "EnvironmentType",
    "Event",
    "EventType",
    "EventBus",
    "Metric",
    "MetricType",
    "MetricsCollector",
    "get_config",
    "set_config",
    "reset_config",
]
