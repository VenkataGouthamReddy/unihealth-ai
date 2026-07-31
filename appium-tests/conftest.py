import pytest
from appium import webdriver
from appium.options.android import UiAutomator2Options
from appium.options.ios import XCUITestOptions

@pytest.fixture(scope="session")
def driver(request):
    platform = request.config.getoption("--platform")
    
    if platform.lower() == "android":
        options = UiAutomator2Options()
        options.platform_name = "Android"
        options.device_name = "Android Emulator"
        # Adjust app path as needed for local build
        options.app = "d:/Projects/PDD/UniHealthAI/android/app/build/outputs/apk/debug/app-debug.apk" 
        options.automation_name = "UiAutomator2"
        options.auto_grant_permissions = True
        
        appium_server_url = "http://127.0.0.1:4723"
        driver = webdriver.Remote(appium_server_url, options=options)
    
    elif platform.lower() == "ios":
        options = XCUITestOptions()
        options.platform_name = "iOS"
        options.device_name = "iPhone 15 Simulator"
        # Adjust app path as needed
        options.app = "d:/Projects/PDD/UniHealthAI/ios/build/UniHealthAI.app"
        options.automation_name = "XCUITest"
        
        appium_server_url = "http://127.0.0.1:4723"
        driver = webdriver.Remote(appium_server_url, options=options)
    else:
        raise ValueError(f"Unsupported platform: {platform}")

    driver.implicitly_wait(10)
    yield driver
    driver.quit()

def pytest_addoption(parser):
    parser.addoption(
        "--platform", action="store", default="android", help="Platform to run tests on: android or ios"
    )
